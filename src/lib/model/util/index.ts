import { forEach, isNil, filter, reduce, find, map } from "lodash";
import { getKeyValue } from "lib/util";
import { FringeUnitModels } from "lib/model";

export * from "./tabling";

export const getFringesNominalAdditions = (value: number, fringes: Model.Fringe[]): number[] => {
  const additionalValues: number[] = [];
  forEach(fringes, (fringe: Model.Fringe) => {
    if (!isNil(fringe.unit) && !isNil(fringe.rate)) {
      if (fringe.unit.id === FringeUnitModels.FLAT.id) {
        additionalValues.push(fringe.rate);
      } else {
        if (fringe.cutoff === null || fringe.cutoff >= value) {
          additionalValues.push(fringe.rate * value);
        } else {
          additionalValues.push(fringe.rate * fringe.cutoff);
        }
      }
    }
  });
  return additionalValues;
};

export const fringeValue = (value: number, fringes: Model.Fringe[]): number => {
  const additionalValues: number[] = getFringesNominalAdditions(value, fringes);
  return value + reduce(additionalValues, (sum: number, val: number) => sum + val, 0);
};

export const unfringeValue = (value: number, fringes: Model.Fringe[]): number => {
  const additionalValues: number[] = [];
  forEach(fringes, (fringe: Model.Fringe) => {
    if (!isNil(fringe.unit) && !isNil(fringe.rate)) {
      if (fringe.unit.id === FringeUnitModels.FLAT.id) {
        additionalValues.push(fringe.rate);
      } else {
        if (fringe.cutoff === null || fringe.cutoff >= value) {
          additionalValues.push(fringe.rate * value);
        } else {
          additionalValues.push(fringe.rate * fringe.cutoff);
        }
      }
    }
  });
  return value - reduce(additionalValues, (sum: number, val: number) => sum + val, 0);
};

export const findChoiceForName = <M extends Model.Choice<number, string>>(
  models: M[],
  name: string,
  caseSensitive = true
): M | null => {
  return caseSensitive
    ? find(models, { name } as any) || null
    : find(models, (model: M) => model.name.toLowerCase() === name.toLowerCase()) || null;
};

export const findChoiceForId = <M extends Model.Choice<number, string>>(models: M[], id: number): M | null => {
  return find(models, { id } as any) || null;
};

type InferModelFromNameParams<M extends Model.Model> = {
  readonly nameField?: keyof M;
  readonly strictUniqueness?: boolean;
  readonly ignoreBlank?: boolean;
};

/**
 * Given a set of models (M[]), tries to infer the model that corresponds to a given
 * string field value (referred to as Name in this case).  This method should be used
 * for inference only, when values may be fuzzy and/or corrupted (i.e. pasting
 * into a table). - it accounts for case insensitivity in the case that uniqueness is still
 *
 * The method accounts for case insensitivity by first determining if a unique result
 * can be determined from the case insensitive filter.  In the case that it cannot,
 * it tries the case sensitive filter.  If this still does not produce a single result,
 * it will either raise an Error or issue a warning and assume the first value.
 *
 * @param models    M[]  List of models that should be filtered.
 * @param value          The value of the name field that we are searching for.
 * @param options   InferModelFromNameParams
 */
export const inferModelFromName = <M extends Model.Model>(
  models: M[],
  value: string,
  options?: InferModelFromNameParams<M>
): M | null => {
  options = !isNil(options) ? options : {};
  const ignoreBlank = !isNil(options.ignoreBlank) ? options.ignoreBlank : true;
  const nameField = !isNil(options.nameField) ? options.nameField : ("name" as keyof M);
  const strictUniqueness = !isNil(options.strictUniqueness) ? options.strictUniqueness : false;

  const performFilter = (caseSensitive: boolean): M[] => {
    const ms: M[] = filter(models, (m: M) => {
      const nameValue = getKeyValue<M, keyof M>(nameField)(m);
      if (!isNil(nameValue) && typeof nameValue === "string") {
        return caseSensitive === false
          ? String(nameValue).trim().toLocaleLowerCase() === String(value).trim().toLocaleLowerCase()
          : String(nameValue).trim() === String(value).trim().toLocaleLowerCase();
      }
      return false;
    });
    return ms;
  };

  if (value.trim() === "" && ignoreBlank) {
    return null;
  } else {
    const ms = performFilter(false);
    if (ms.length === 0) {
      // If there are no matches when case is insensitive, there will also be no
      // matches when case is sensitive.
      return null;
    } else if (ms.length === 1) {
      return ms[0];
    } else {
      // If there are multiple matches, we need to restrict base on case sensitivity.
      const msCaseSensitive = performFilter(true);
      if (msCaseSensitive.length === 0) {
        return null;
      } else if (msCaseSensitive.length === 1) {
        return msCaseSensitive[0];
      } else {
        if (strictUniqueness) {
          throw new Error(`Multiple models exist for field=${nameField} value=${value}.`);
        } else {
          /* eslint-disable no-console */
          console.warn(`Multiple models exist for field=${nameField} value=${value}.`);
          return msCaseSensitive[0];
        }
      }
    }
  }
};

type GetModelsByIdOptions = {
  readonly throwOnMissing?: boolean;
  readonly warnOnMissing?: boolean;
  readonly modelName?: string;
};

export const getModelById = <M extends Model.Model>(
  models: M[],
  id: number,
  options: GetModelsByIdOptions = { throwOnMissing: false, warnOnMissing: true }
): M | null => {
  const model: M | undefined = find(models, { id } as any);
  if (isNil(model)) {
    if (options.throwOnMissing === true) {
      throw new Error(`Cannot find ${options.modelName || "model"} with ID ${id} in provided models!`);
    } else if (options.warnOnMissing === true) {
      /* eslint-disable no-console */
      console.warn(`Cannot find ${options.modelName || "model"} with ID ${id} in provided models!`);
    }
    return null;
  } else {
    return model;
  }
};

export const getModelsByIds = <M extends Model.Model>(
  models: M[],
  ids: number[],
  options: GetModelsByIdOptions = { throwOnMissing: false, warnOnMissing: true }
): M[] => {
  return filter(
    map(ids, (id: number) => getModelById(models, id, options)),
    (m: M | null) => !isNil(m)
  ) as M[];
};
