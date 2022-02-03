import { isNil, filter, includes, reduce, find } from "lodash";
import { redux, util, notifications } from "lib";

export const listResponseReducerTransformers = <M, S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>>(
  initialState: S
): Redux.Transformers<S, Redux.ListResponseActionMap<M>> => ({
  request: (st: S = initialState) => ({
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
  S extends Redux.ModelListResponseStore<M> | Redux.ModelListResponseStore<M>,
  P extends Redux.ActionPayload = null
>(
  initialState: S
): Redux.Transformers<S, Redux.ModelListResponseActionMap<M, P>> => ({
  ...listResponseReducerTransformers<M, S>(initialState)
});

export const authenticatedModelListResponseReducerTransformers = <
  M extends Model.HttpModel,
  S extends Redux.AuthenticatedModelListResponseStore<M> | Redux.AuthenticatedModelListResponseStore<M>,
  P extends Redux.ActionPayload = null,
  C extends Table.Context = Table.Context
>(
  initialState: S
): Redux.Transformers<S, Redux.AuthenticatedModelListResponseActionMap<M, P, C>> => ({
  ...listResponseReducerTransformers<M, S>(initialState),
  setSearch: (st: S = initialState, action: Redux.TableAction<string, C>) => ({
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
  request: (st: S = initialState) => ({
    ...st,
    data: [],
    count: 0,
    selected: [],
    responseWasReceived: false
  }),
  removeFromState: (st: S = initialState, action: Redux.Action<number>) => {
    const existing = redux.reducers.findModelInData(action, st.data, action.payload);
    if (isNil(existing)) {
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
  },
  updateInState: (st: S = initialState, action: Redux.Action<Redux.UpdateActionPayload<M>>) => {
    const existing = redux.reducers.findModelInData(action, st.data, action.payload.id);
    if (isNil(existing)) {
      return st;
    }
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { id: _, ...withoutId } = action.payload.data;
    return {
      ...st,
      data: util.replaceInArray<M>(st.data, { id: action.payload.id }, { ...existing, ...withoutId })
    };
  },
  creating: (st: S = initialState, action: Redux.Action<boolean>) => ({ ...st, creating: action.payload }),
  deleting: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) => ({
    ...st,
    deleting: redux.reducers.modelListActionReducer(st.deleting, action)
  }),
  updating: (st: S = initialState, action: Redux.Action<Redux.ModelListActionPayload>) => ({
    ...st,
    updating: redux.reducers.modelListActionReducer(st.updating, action)
  }),
  addToState: (st: S = initialState, action: Redux.Action<M>) => {
    const existing = redux.reducers.findModelInData(action, st.data, action.payload.id, { warnOnMissing: false });
    if (!isNil(existing)) {
      notifications.inconsistentStateError({
        action: action,
        reason: "Instance already exists in state when it is not expected to."
      });
      return st;
    } else {
      return { ...st, data: [...st.data, action.payload], count: st.count + 1 };
    }
  },
  updateOrdering: (st: S = initialState, action: Redux.Action<Redux.UpdateOrderingPayload<string>>) => {
    const existing: Http.FieldOrder<string> | undefined = find(st.ordering, { field: action.payload.field });
    if (isNil(existing)) {
      notifications.inconsistentStateError({
        action: action,
        reason: "Ordering for field does not exist in state when it is expected to."
      });
      return st;
    } else {
      return {
        ...st,
        ordering: reduce(
          st.ordering,
          (curr: Http.Ordering<string>, o: Http.FieldOrder<string>) => {
            if (o.field === action.payload.field) {
              return [...curr, { ...o, order: action.payload.order }];
            }
            return [...curr, { ...o, order: 0 }];
          },
          []
        )
      };
    }
  },
  setPagination: (st: S = initialState, action: Redux.Action<Pagination>) => {
    return !isNil(action.payload.pageSize)
      ? { ...st, page: action.payload.page, pageSize: action.payload.pageSize }
      : { ...st, page: action.payload.page };
  }
});
