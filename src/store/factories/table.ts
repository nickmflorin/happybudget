import { isNil, find, filter } from "lodash";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";
import { createListReducerFromTransformers } from "./util";
import Mapping from "model/tableMappings";

export const createTablePlaceholdersReducer = <
  /* eslint-disable indent */
  R extends Table.Row<C>,
  M extends Model,
  P extends Http.IPayload,
  C extends Model = UnknownModel,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ReducerFactory.ITablePlaceholdersActionMap>,
  mapping: Mapping<R, M, P, C>,
  options: Partial<ReducerFactory.IOptions<Redux.ListStore<R>>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeWithDefaults<ReducerFactory.IOptions<Redux.ListStore<R>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });

  const transformers: ReducerFactory.Transformers<ReducerFactory.ITablePlaceholdersActionMap, Redux.ListStore<R>, A> = {
    Clear: () => [],
    AddToState: (count: number | undefined, st: Redux.ListStore<R>) => {
      const placeholders: R[] = [];
      const numPlaceholders = count || 1;
      for (let i = 0; i < numPlaceholders; i++) {
        placeholders.push(mapping.createPlaceholder());
      }
      return [...st, ...placeholders];
    },
    RemoveFromState: (id: number, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing the ${Options.referenceEntity}
          placeholder in state... the ${Options.referenceEntity} placeholder row with ID ${id}
          does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return filter(st, (r: R) => r.id !== id);
      }
    },
    Activate: (payload: Table.ActivatePlaceholderPayload<M>, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when activating the ${Options.referenceEntity}
          placeholder in state... the ${Options.referenceEntity} placeholder row with ID ${payload.id}
          does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(
          st,
          { id: payload.id },
          {
            ...row,
            // NOTE: This will be a problem if the placeholder belonged to a group!
            ...mapping.modelToRow(payload.model, null)
          }
        );
      }
    },
    UpdateInState: (payload: R, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating the ${Options.referenceEntity}
          placeholder in state... the ${Options.referenceEntity} placeholder row with ID ${payload.id}
          does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(
          st,
          { id: payload.id },
          {
            ...row,
            ...payload
          }
        );
      }
    }
  };
  return createListReducerFromTransformers<ReducerFactory.ITablePlaceholdersActionMap, R, A>(
    mappings,
    transformers,
    Options
  );
};
