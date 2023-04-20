import { find } from "lodash";

import { store } from "application";
import { logger } from "internal";

import * as reference from "./reference";
import * as types from "./types";

type BaseParams<M extends types.Model> = Omit<GetModelOptions<M>, "onMissing"> & {
  readonly caseInsensitive?: boolean;
};

export type InferModelFromNameOptions<
  M extends types.Model | (types.Model & { readonly name?: string | null }),
> = M extends types.Model & { readonly name: string | null }
  ? BaseParams<M> & {
      readonly getName?: (m: M) => string | null;
    }
  : BaseParams<M> & {
      readonly getName: (m: M) => string | null;
    };

/**
 * Given a set of models, {@link M[]}, the function attempts to infer the model, {@link M} that
 * has a name corresponding to the provided string value, {@link string}.
 *
 * This method should only be used for inference, when values may be fuzzy and/or corrupted (i.e.
 * pasting into a table).
 *
 * The method accounts for case insensitivity by first determining if a unique result can be
 * determined from the case sensitive filter.  If it cannot, it tries the case insensitive filter.
 * If this still does not produce a single result, it will issue a warning and assume the first
 * value.
 *
 * @param {M[]} models  The list of models for which the name should be searched.
 *
 * @param {string} value  The value of the name field that we are searching for.
 *
 * @param {InferModelFromNameParams} options Options for the inference.
 */
export const inferModelFromName = <
  M extends types.Model | (types.Model & { readonly name?: string | null }),
  O extends InferModelFromNameOptions<M> = InferModelFromNameOptions<M>,
>(
  models: M[],
  value: string,
  options: O,
): M | null => {
  const getName = (m: M): string | null => {
    if (options?.getName !== undefined) {
      const name = options?.getName(m);
      if (name === undefined) {
        /* The type bindings are such that this is avoided, but just in case we want to be aware of
           the fact that the callback returned undefined before proceeding. */
        throw new Error("The 'getName' callback unexpectedly returned undefined.");
      }
      return name;
    }
    /* Since the 'getName' callback is not provided, TypeScript should have guaranteed that the
       model type M has a 'name' attribute. */
    const modelWithName = m as M & { readonly name: string | null };
    if (modelWithName.name === undefined) {
      /* This error is a fallback for the case where the type bindings are not properly catching
         the improper usage of the method. */
      throw new Error(
        "The 'getName' callback was not provided and the model does not have a 'name' attribute.",
      );
    }
    return modelWithName.name;
  };

  const performFilter = (caseSensitive: boolean): M[] =>
    models.filter((m: M) => {
      const nameValue = getName(m);
      if (nameValue !== null) {
        return caseSensitive === false
          ? nameValue.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase()
          : nameValue.trim() === value.trim().toLocaleLowerCase();
      }
      return false;
    });

  const returnAndWarn = (m: M | null): M | null => {
    if (options?.warnOnMissing !== false && m === null) {
      logger.warn(
        { name: value },
        `Cannot infer model ${reference.modelStringReference(models, {
          modelName: options?.modelName || "unknown",
        })} from name ${value} in the provided set of models!`,
      );
      return null;
    }
    return m;
  };

  const filtered = performFilter(false);
  if (filtered.length === 0) {
    /* If there are no matches when case is insensitive, there will also be no matches when case is
       sensitive. */
    return returnAndWarn(null);
  } else if (filtered.length === 1) {
    return returnAndWarn(filtered[0]);
  } else if (options?.caseInsensitive === false) {
    logger.warn(
      { name: value },
      `Multiple ${reference.modelStringReference(models, {
        modelName: options?.modelName || "unknown",
      })}(s) exist for name ${value} in the provided set of models - assuming the first.`,
    );
    return returnAndWarn(filtered[0]);
  } else {
    // If there are multiple matches, we need to restrict base on case sensitivity.
    const msCaseSensitive = performFilter(true);
    if (msCaseSensitive.length === 0) {
      return returnAndWarn(null);
    } else if (msCaseSensitive.length === 1) {
      return returnAndWarn(msCaseSensitive[0]);
    } else {
      logger.warn(
        { name: value },
        `Multiple ${reference.modelStringReference(models, {
          modelName: options?.modelName || "unknown",
        })}(s) exist for name ${value} in the provided set of models - assuming the first.`,
      );
      return returnAndWarn(msCaseSensitive[0]);
    }
  }
};

type OnModelMissingCallbackParams<M extends types.Model> = {
  readonly ref: string;
  readonly lookup: ModelLookup<M>;
};

const onMissing =
  <M extends types.Model>(data: M[], warningData?: Record<string, unknown>) =>
  (params: OnModelMissingCallbackParams<M>) => {
    const mutatedWarningData = {
      reason: `${params.ref} does not exist in state when it is expected to.`,
      ids: JSON.stringify(data.map((mi: M) => mi.id)),
      ...warningData,
    };
    const lookup = params.lookup;
    if (typeof lookup === "function") {
      logger.inconsistentReduxStateError({
        ...mutatedWarningData,
        evaluatedCallback: JSON.stringify(data.map((mi: M) => lookup(mi))),
      });
    } else {
      logger.inconsistentReduxStateError({ ...mutatedWarningData, id: lookup });
    }
  };

export type ModelLookup<M extends types.Model> = M["id"] | ((m: M) => boolean);

export type GetModelOptions<M extends types.Model> = {
  readonly modelName?: string;
  readonly warnOnMissing?: boolean;
  readonly onMissing?: (params: OnModelMissingCallbackParams<M>) => void;
};

export const getModel = <M extends types.Model>(
  ms: M[],
  id: ModelLookup<M>,
  options?: GetModelOptions<M>,
): M | null => {
  const predicate = typeof id === "function" ? id : (m: M) => m.id === id;
  const model: M | undefined = find(ms, predicate);
  if (model === undefined) {
    if (options?.onMissing !== undefined && options?.warnOnMissing !== false) {
      options?.onMissing({
        ref: reference.modelStringReference(ms, options),
        lookup: id,
      });
    } else if (options?.warnOnMissing !== false) {
      logger.warn(
        `Cannot find ${reference.modelStringReference(ms, {
          modelName: options?.modelName,
        })} in provided models!`,
      );
    }
    return null;
  } else {
    return model;
  }
};

export const getModels = <M extends types.Model>(
  ms: M[],
  ids: ModelLookup<M>[],
  options?: GetModelOptions<M>,
): M[] =>
  ids
    .map((id: ModelLookup<M>) => getModel(ms, id, options))
    .filter((m: M | null) => m !== undefined) as M[];

export type GetReduxModelOptions<M extends types.Model> = Omit<GetModelOptions<M>, "onMissing"> & {
  readonly action?: store.Action;
  readonly warningData?: Record<string, unknown>;
};

export const getModelInState = <M extends types.Model>(
  data: M[],
  id: ModelLookup<M>,
  options?: GetReduxModelOptions<M>,
): M | null =>
  getModel(data, id, {
    ...options,
    onMissing: onMissing(data, { action: options?.action, ...options?.warningData }),
  });

export const getModelsInState = <M extends types.Model>(
  data: M[],
  id: ModelLookup<M>[],
  options?: GetReduxModelOptions<M>,
): M[] =>
  getModels<M>(data, id, {
    ...options,
    onMissing: onMissing(data, { action: options?.action, ...options?.warningData }),
  });

const isModel = <M extends types.Model>(m: ModelLookup<M> | M): m is M =>
  !(typeof m === "number" || typeof m === "string" || typeof m === "function");

export const modelFromState = <M extends types.Model>(
  data: M[],
  id: ModelLookup<M> | M,
  options?: GetReduxModelOptions<M>,
): M | null => (isModel(id) ? id : getModelInState<M>(data, id, options));
