import { isNil, forEach, find, filter, includes, map } from "lodash";
import { redux, util } from "lib";

import { warnInconsistentState } from "../../util";

/* eslint-disable indent */
export const listResponseReducerTransformers = <M, S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>>(
  initialState: S
): Redux.MappedReducers<Redux.ListResponseActionMap, S> => ({
  Response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      data: action.payload.data,
      count: action.payload.count,
      selected: [],
      responseWasReceived: true
    };
  },
  Request: (st: S = initialState, action: Redux.Action<null>) => ({ ...st, responseWasReceived: false }),
  Loading: (st: S = initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload })
});

/* eslint-disable indent */
export const readOnlyModelListResponseReducerTransformers = <
  M extends Model.Model,
  S extends Redux.ReadOnlyModelListResponseStore<M> = Redux.ReadOnlyModelListResponseStore<M>
>(
  initialState: S
): Redux.MappedReducers<Redux.ReadOnlyModelListResponseActionMap, S> => ({
  ...readOnlyTableReducerTransformers<M, S>(initialState),
  SetSearch: (st: S = initialState, action: Redux.Action<string>) => ({
    ...st,
    search: action.payload
  }),
  Response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      data: action.payload.data,
      count: action.payload.count,
      responseWasReceived: true,
      cache: {
        ...st.cache,
        [st.search]: {
          data: action.payload.data,
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous
        }
      }
    };
  },
  Request: (st: S = initialState, action: Redux.Action<null>) => ({
    ...st,
    responseWasReceived: false,
    data: [],
    count: 0,
    cache: {}
  }),
  RestoreSearchCache: (st: S = initialState, action: Redux.Action<null>) => {
    const cachedResponse: Http.ListResponse<M> = st.cache[st.search];
    if (!isNil(cachedResponse)) {
      return {
        ...st,
        data: cachedResponse.data,
        count: cachedResponse.count
      };
    }
    return st;
  }
});

/* eslint-disable indent */
export const modelListResponseReducerTransformers = <
  M extends Model.Model,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>
>(
  initialState: S,
  strictSelect?: boolean
): Redux.MappedReducers<Redux.ModelListResponseActionMap, S> => ({
  ...tableReducerTransformers<M, S>(initialState),
  // We have to reset the page to it's initial state otherwise we run the risk
  // of a 404 with the API request due to the page not being found.
  SetSearch: (st: S = initialState, action: Redux.Action<string>) => ({
    ...st,
    search: action.payload
  }),
  Response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      data: action.payload.data,
      count: action.payload.count,
      selected: [],
      responseWasReceived: true,
      cache: {
        ...st.cache,
        [st.search]: {
          data: action.payload.data,
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous
        }
      }
    };
  },
  Request: (st: S = initialState, action: Redux.Action<null>) => ({
    ...st,
    responseWasReceived: false,
    data: [],
    count: 0,
    selected: [],
    cache: {}
  }),
  RemoveFromState: (st: S = initialState, action: Redux.Action<number>) => {
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
  AddToState: (st: S = initialState, action: Redux.Action<M>) => {
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
      return { ...st, data: [...st.data, action.payload], count: st.count + 1 };
    }
  },
  RestoreSearchCache: (st: S = initialState, action: Redux.Action<null>) => {
    const cachedResponse: Http.ListResponse<M> = st.cache[st.search];
    if (!isNil(cachedResponse)) {
      return {
        ...st,
        data: cachedResponse.data,
        count: cachedResponse.count
      };
    }
    return st;
  },
  Deselect: (st: S = initialState, action: Redux.Action<number>) => {
    const element = find(st.data, { id: action.payload });
    if (!isNil(element) || strictSelect === false) {
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
  SelectAll: (st: S = initialState, action: Redux.Action<null>) => {
    if (st.selected.length === st.data.length) {
      return { ...st, selected: [] };
    } else {
      return { ...st, selected: map(st.data, (model: M) => model.id) };
    }
  },
  Select: (st: S = initialState, action: Redux.Action<number | number[]>) => {
    const selected: number[] = [];
    if (Array.isArray(action.payload)) {
      forEach(action.payload, (id: number) => {
        const element = find(st.data, { id });
        if (!isNil(element) || strictSelect === false) {
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
      if (!isNil(element) || strictSelect === false) {
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
  }
});

/* eslint-disable indent */
export const readOnlyTableReducerTransformers = <
  M extends Model.Model,
  S extends Redux.ReadOnlyTableStore<M> = Redux.ReadOnlyTableStore<M>
>(
  initialState: S
): Redux.MappedReducers<Redux.ReadOnlyTableActionMap, S> => ({
  SetSearch: (st: S = initialState, action: Redux.Action<string>) => ({
    ...st,
    search: action.payload
  }),
  Response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      data: action.payload.data,
      count: action.payload.count,
      responseWasReceived: true
    };
  },
  Request: (st: S = initialState, action: Redux.Action<null>) => ({
    ...st,
    responseWasReceived: false,
    data: [],
    count: 0
  }),
  Loading: (st: S = initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload })
});

/* eslint-disable indent */
export const tableReducerTransformers = <M extends Model.Model, S extends Redux.TableStore<M> = Redux.TableStore<M>>(
  initialState: S
): Redux.MappedReducers<Redux.TableActionMap, S> => ({
  ...readOnlyTableReducerTransformers<M, S>(initialState),
  AddToState: (st: S = initialState, action: Redux.Action<M>) => {
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
      return { ...st, data: [...st.data, action.payload], count: st.count + 1 };
    }
  },
  RemoveFromState: (st: S = initialState, action: Redux.Action<number>) => {
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
        count: st.count - 1
      };
      return { ...st, ...partial };
    }
  },
  UpdateInState: (st: S = initialState, action: Redux.Action<Redux.UpdateModelActionPayload<M>>) => {
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
    const { id: _, ...withoutId } = action.payload.data;
    return {
      ...st,
      data: util.replaceInArray<M>(st.data, { id: action.payload.id }, { ...existing, ...withoutId })
    };
  },
  Creating: (st: S = initialState, action: Redux.Action<boolean>) => ({ ...st, creating: action.payload }),
  Deleting: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) => {
    return {
      ...st,
      deleting: redux.reducers.modelListActionReducer(st.deleting, action)
    };
  },
  Updating: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) => {
    return {
      ...st,
      updating: redux.reducers.modelListActionReducer(st.updating, action)
    };
  }
});
