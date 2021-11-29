import { isNil, find, filter, includes } from "lodash";
import { redux, util } from "lib";

/* eslint-disable indent */
export const listResponseReducerTransformers = <M, S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>>(
  initialState: S
): Redux.Transformers<S, Redux.ListResponseActionMap<M>> => ({
  request: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => ({
    ...st,
    responseWasReceived: false
  }),
  response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      responseWasReceived: true,
      data: action.payload.data,
      count: action.payload.count
    };
  },
  loading: (st: S = initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload })
});

export const modelListResponseReducerTransformers = <
  M extends Model.HttpModel,
  S extends Redux.ModelListResponseStore<M> | Redux.ModelListResponseStore<M>
>(
  initialState: S
): Redux.Transformers<S, Redux.ModelListResponseActionMap<M>> => ({
  ...listResponseReducerTransformers<M, S>(initialState)
});

/* eslint-disable indent */
export const authenticatedModelListResponseReducerTransformers = <
  M extends Model.HttpModel,
  S extends Redux.AuthenticatedModelListResponseStore<M> | Redux.AuthenticatedModelListResponseStore<M>
>(
  initialState: S
): Redux.Transformers<S, Redux.AuthenticatedModelListResponseActionMap<M>> => ({
  ...listResponseReducerTransformers<M, S>(initialState),
  setSearch: (st: S = initialState, action: Redux.Action<string>) => ({
    ...st,
    search: action.payload
  }),
  response: (st: S = initialState, action: Redux.Action<Http.ListResponse<M>>) => {
    return {
      ...st,
      data: action.payload.data,
      count: action.payload.count,
      selected: [],
      responseWasReceived: true
    };
  },
  request: (st: S = initialState, action: Redux.Action<null>) => ({
    ...st,
    data: [],
    count: 0,
    selected: [],
    responseWasReceived: false
  }),
  removeFromState: (st: S = initialState, action: Redux.Action<ID>) => {
    if (action.isAuthenticated === true) {
      const existing = find(st.data, { id: action.payload });
      if (isNil(existing)) {
        redux.util.warnInconsistentState({
          action: action,
          reason: "Instance does not exist in state when it is expected to."
        });
        return st;
      } else {
        const partial = {
          data: filter(st.data, (entity: M) => entity.id !== action.payload),
          count: st.count - 1,
          selected: st.selected
        };
        // Also remove the document from the selected documents.
        if (includes(st.selected, action.payload)) {
          partial.selected = filter(st.selected, (id: ID) => id !== action.payload);
        }
        return { ...st, ...partial };
      }
    }
    return st;
  },
  updateInState: (st: S = initialState, action: Redux.Action<Redux.UpdateActionPayload<M>>) => {
    if (action.isAuthenticated === true) {
      const existing: M | undefined = find(st.data, { id: action.payload.id } as any);
      // TODO: If the entity does not exist in the state when updating, should
      // we auto add it?
      if (isNil(existing)) {
        redux.util.warnInconsistentState({
          action: action,
          reason: "Instance does not exist in state when it is expected to."
        });
        return st;
      }
      const { id: _, ...withoutId } = action.payload.data;
      return {
        ...st,
        data: util.replaceInArray<M>(st.data, { id: action.payload.id }, { ...existing, ...withoutId })
      };
    }
    return st;
  },
  creating: (st: S = initialState, action: Redux.Action<boolean>) =>
    action.isAuthenticated ? { ...st, creating: action.payload } : st,
  deleting: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) =>
    action.isAuthenticated
      ? {
          ...st,
          deleting: redux.reducers.modelListActionReducer(st.deleting, action)
        }
      : st,
  updating: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) =>
    action.isAuthenticated
      ? {
          ...st,
          updating: redux.reducers.modelListActionReducer(st.updating, action)
        }
      : st,
  addToState: (st: S = initialState, action: Redux.Action<M>) => {
    if (action.isAuthenticated === true) {
      const existing = find(st.data, { id: action.payload.id });
      if (!isNil(existing)) {
        redux.util.warnInconsistentState({
          action: action,
          reason: "Instance already exists in state when it is not expected to."
        });
        return st;
      } else {
        return { ...st, data: [...st.data, action.payload], count: st.count + 1 };
      }
    }
    return st;
  },
  setPagination: (st: S = initialState, action: Redux.Action<Pagination>) => {
    return !isNil(action.payload.pageSize)
      ? { ...st, page: action.payload.page, pageSize: action.payload.pageSize }
      : { ...st, page: action.payload.page };
  }
});
