import { isNil, find, filter } from "lodash";
import Mapping from "lib/tabling/managers";
import { replaceInArray } from "lib/util";
import { warnInconsistentState } from "../util";
import { createListReducerFromMap, mergeOptionsWithDefaults } from "./util";
import { MappedReducers, FactoryOptions } from ".";

export type ITablePlaceholdersActionMap = {
  AddToState: string;
  Clear: string;
  RemoveFromState: string;
  UpdateInState: string;
};

export const createTablePlaceholdersReducer = <
  /* eslint-disable indent */
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.ModelPayload<M>,
  C extends Model = Model,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ITablePlaceholdersActionMap>,
  mapping: Mapping<R, M, G, P, C>,
  options: Partial<FactoryOptions<Redux.ListStore<R>>> = {}
) => {
  const Options = mergeOptionsWithDefaults<Redux.ListStore<R>>(options, []);

  const transformers: MappedReducers<ITablePlaceholdersActionMap, Redux.ListStore<R>, A> = {
    Clear: () => [],
    AddToState: (st: Redux.ListStore<R> = [], action: Redux.IAction<number | null>) => {
      const placeholders: R[] = [];
      const numPlaceholders = action.payload || 1;
      for (let i = 0; i < numPlaceholders; i++) {
        placeholders.push(mapping.createPlaceholder());
      }
      return [...st, ...placeholders];
    },
    RemoveFromState: (st: Redux.ListStore<R> = [], action: Redux.IAction<number>) => {
      const row: R | undefined = find(st, { id: action.payload } as any);
      if (isNil(row)) {
        warnInconsistentState({
          action: action.type,
          reason: "Placeholder does not exist in state when it is expected to."
        });
        return st;
      } else {
        return filter(st, (r: R) => r.id !== action.payload);
      }
    },
    UpdateInState: (st: Redux.ListStore<R> = [], action: Redux.IAction<R>) => {
      const row: R | undefined = find(st, { id: action.payload.id } as any);
      if (isNil(row)) {
        warnInconsistentState({
          action: action.type,
          reason: "Placeholder does not exist in state when it is expected to."
        });
        return st;
      } else {
        return replaceInArray<R>(
          st,
          { id: action.payload.id },
          {
            ...row,
            ...action.payload
          }
        );
      }
    }
  };
  return createListReducerFromMap<ITablePlaceholdersActionMap, R, A>(mappings, transformers, Options);
};
