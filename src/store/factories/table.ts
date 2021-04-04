import { isNil, find, filter } from "lodash";
import { createListReducerFromTransformers, mergeOptionsWithDefaults } from "store/factories/util";
import Mapping from "model/tableMappings";
import { replaceInArray } from "util/arrays";

export const createTablePlaceholdersReducer = <
  /* eslint-disable indent */
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload,
  C extends Model = UnknownModel,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ReducerFactory.ITablePlaceholdersActionMap>,
  mapping: Mapping<R, M, G, P, C>,
  options: Partial<ReducerFactory.IOptions<Redux.ListStore<R>>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeOptionsWithDefaults<Redux.ListStore<R>>(options, []);

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
