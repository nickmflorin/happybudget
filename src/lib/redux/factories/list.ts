import { Reducer } from "redux";
import { isNil, forEach, find, filter, includes, map } from "lodash";
import { replaceInArray } from "lib/util";
import { initialListResponseState } from "store/initialState";

import { warnInconsistentState } from "../util";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";
import { MappedReducers, FactoryOptions, createAgnosticModelListActionReducer } from ".";

export type IListResponseActionMap = {
  SetSearch: string;
  Loading: string;
  Response: string;
  SetPage: string;
  SetPageSize: string;
  SetPageAndSize: string;
  AddToState: string;
  RemoveFromState: string;
  UpdateInState: string;
  Select: string;
  SelectAll: string;
  Deselect: string;
  Request: string;
  Deleting: string;
  Updating: string;
  Creating: string;
};

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createListResponseReducer = <
  M extends Model,
  S extends Redux.IListResponseStore<M> = Redux.IListResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<IListResponseActionMap>,
  options: Partial<FactoryOptions<S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<S, A>(options, initialListResponseState as S);

  const DeletingReducer = createAgnosticModelListActionReducer();
  const UpdatingReducer = createAgnosticModelListActionReducer();

  const reducers: MappedReducers<IListResponseActionMap, S, A> = {
    // We have to reset the page to it's initial state otherwise we run the risk
    // of a 404 with the API request due to the page not being found.
    SetSearch: (st: S = Options.initialState, action: Redux.IAction<string>) => ({
      ...st,
      page: 1,
      search: action.payload
    }),
    Response: (st: S = Options.initialState, action: Redux.IAction<Http.IListResponse<M>>) => {
      return {
        ...st,
        data: action.payload.data,
        count: action.payload.count,
        selected: [],
        responseWasReceived: true
      };
    },
    Request: (st: S = Options.initialState, action: Redux.IAction<null>) => ({ ...st, responseWasReceived: false }),
    Loading: (st: S = Options.initialState, action: Redux.IAction<boolean>) => ({ ...st, loading: action.payload }),
    SetPage: (st: S = Options.initialState, action: Redux.IAction<number>) => ({
      ...st,
      page: action.payload,
      selected: []
    }),
    SetPageSize: (st: S = Options.initialState, action: Redux.IAction<number>) => ({
      ...st,
      pageSize: action.payload,
      selected: []
    }),
    SetPageAndSize: (st: S = Options.initialState, action: Redux.IAction<PageAndSize>) => ({
      ...st,
      pageSize: action.payload.pageSize,
      page: action.payload.page,
      selected: []
    }),
    AddToState: (st: S = Options.initialState, action: Redux.IAction<M>) => {
      const existing = find(st.data, { id: action.payload.id });
      if (!isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          warnInconsistentState({
            action: action.type,
            reason: "Instance already exists in state when it is not expected to."
          });
        }
        return st;
      } else {
        let pageSize = st.pageSize;
        if (st.data.length + 1 >= st.pageSize) {
          pageSize = st.pageSize + 1;
        }
        return { ...st, data: [...st.data, action.payload], count: st.count + 1, pageSize };
      }
    },
    RemoveFromState: (st: S = Options.initialState, action: Redux.IAction<number>) => {
      const existing = find(st.data, { id: action.payload });
      if (isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          warnInconsistentState({
            action: action.type,
            reason: "Instance does not exist in state when it is expected to."
          });
        }
        return st;
      } else {
        const partial = {
          data: filter(st.data, (entity: M) => entity.id !== action.payload),
          count: st.count - 1,
          selected: st.selected
        };
        // Also remove the document from the selected documents.
        if (includes(st.selected, action.payload)) {
          partial.selected = filter(st.selected, (id: number) => id !== action.payload);
        }
        return { ...st, ...partial };
      }
    },
    UpdateInState: (st: S = Options.initialState, action: Redux.IAction<M>) => {
      const existing: M | undefined = find(st.data, { id: action.payload.id } as any);
      // TODO: If the entity does not exist in the state when updating, should
      // we auto add it?
      if (isNil(existing)) {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          warnInconsistentState({
            action: action.type,
            reason: "Instance does not exist in state when it is expected to."
          });
        }
        return st;
      }
      const { id: _, ...withoutId } = action.payload;
      return { ...st, data: replaceInArray<M>(st.data, { id: action.payload.id }, { ...existing, ...withoutId }) };
    },
    Deselect: (st: S = Options.initialState, action: Redux.IAction<number>) => {
      const element = find(st.data, { id: action.payload });
      if (!isNil(element) || Options.strictSelect === false) {
        if (!includes(st.selected, action.payload)) {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            warnInconsistentState({
              action: action.type,
              reason: "Instance does not exist in selected state when it is expected to."
            });
          }
          return st;
        }
        return { ...st, selected: filter(st.selected, (id: number) => id !== action.payload) };
      } else {
        if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
          warnInconsistentState({
            action: action.type,
            reason: "Instance does not exist in selected state when it is expected to."
          });
        }
        return st;
      }
    },
    SelectAll: (st: S = Options.initialState, action: Redux.IAction<null>) => {
      if (st.selected.length === st.data.length) {
        return { ...st, selected: [] };
      } else {
        return { ...st, selected: map(st.data, (model: M) => model.id) };
      }
    },
    Select: (st: S = Options.initialState, action: Redux.IAction<number | number[]>) => {
      const selected: number[] = [];
      if (Array.isArray(action.payload)) {
        forEach(action.payload, (id: number) => {
          const element = find(st.data, { id });
          if (!isNil(element) || Options.strictSelect === false) {
            selected.push(id);
          } else {
            if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
              warnInconsistentState({
                action: action.type,
                reason: "Instance exist in selected state when it is not expected to."
              });
            }
          }
        });
        return { ...st, selected };
      } else {
        const element = find(st.data, { id: action.payload });
        if (!isNil(element) || Options.strictSelect === false) {
          return { ...st, selected: [...st.selected, action.payload] };
        } else {
          if (!isNil(action.meta) && action.meta.ignoreInconsistentState !== true) {
            warnInconsistentState({
              action: action.type,
              reason: "Instance exists in selected state when it is not expected to."
            });
          }
          return st;
        }
      }
    },
    Creating: (st: S = Options.initialState, action: Redux.IAction<boolean>) => ({ ...st, creating: action.payload }),
    Deleting: (st: S = Options.initialState, action: Redux.IAction<Redux.ModelListActionPayload>) => {
      return {
        ...st,
        deleting: DeletingReducer(st.deleting, action)
      };
    },
    Updating: (st: S = Options.initialState, action: Redux.IAction<Redux.ModelListActionPayload>) => {
      return {
        ...st,
        updating: UpdatingReducer(st.updating, action)
      };
    }
  };

  return createObjectReducerFromMap<IListResponseActionMap, S, A>(mappings, reducers, Options);
};
