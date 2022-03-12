import { isNil, filter, find, reduce } from "lodash";

import { redux, util, notifications } from "lib";

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param config  The Redux.ReducerConfig object that contains information about
 *                the behavior of the reducer returned from the factory.
 */
export const createListResponseReducer =
  <
    M,
    P extends Redux.ActionPayload = null,
    S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>,
    A extends Redux.Action = Redux.Action
  >(
    config: Redux.ReducerConfig<S, Redux.ListResponseActionMap<M, P>>
  ): Redux.Reducer<S, A> =>
  (state: S = config.initialState, action: A): S => {
    if (!isNil(config.actions.request) && action.type === config.actions.request.toString()) {
      return { ...state, responseWasReceived: false };
    } else if (!isNil(config.actions.loading) && action.type === config.actions.loading.toString()) {
      return { ...state, loading: action.payload };
    } else if (!isNil(config.actions.response) && action.type === config.actions.response.toString()) {
      return {
        ...state,
        responseWasReceived: true,
        data: action.payload.data,
        count: action.payload.count
      };
    }
    return state;
  };

export const createModelListResponseReducer = <
  M extends Model.HttpModel,
  P extends Redux.ActionPayload = null,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>,
  A extends Redux.Action = Redux.Action,
  AM extends Redux.ModelListResponseActionMap<M, P> = Redux.ModelListResponseActionMap<M, P>
>(
  config: Redux.ReducerConfig<S, AM>
): Redux.Reducer<S, A> => createListResponseReducer(config);

export const withAuthentication =
  <
    M extends Model.HttpModel,
    P extends Redux.ActionPayload = null,
    C extends Table.Context = Table.Context,
    S extends Redux.AuthenticatedModelListResponseStore<M> = Redux.AuthenticatedModelListResponseStore<M>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    A extends Redux.TableAction<any, C> = Redux.TableAction<any, C>
  >(
    reducer: Redux.Reducer<S, A>,
    config: Redux.ReducerConfig<S, Redux.AuthenticatedModelListResponseActionMap<M, P, C>>
  ): Redux.Reducer<S, A> =>
  (state: S = config.initialState, action: A): S => {
    state = reducer(state, action);
    if (!isNil(config.actions.setSearch) && action.type === config.actions.setSearch.toString()) {
      const a: Redux.InferAction<typeof config.actions.setSearch> = action;
      return { ...state, search: a.payload };
    } else if (!isNil(config.actions.request) && action.type === config.actions.request.toString()) {
      return { ...state, data: [], count: 0 };
    } else if (!isNil(config.actions.removeFromState) && action.type === config.actions.removeFromState.toString()) {
      const a: Redux.InferAction<typeof config.actions.removeFromState> = action;
      const existing = redux.reducers.findModelInData(state.data, a.payload, { action: a });
      if (isNil(existing)) {
        return state;
      }
      return {
        ...state,
        data: filter(state.data, (entity: M) => entity.id !== a.payload),
        count: state.count - 1
      };
    } else if (!isNil(config.actions.updateInState) && action.type === config.actions.updateInState.toString()) {
      const a: Redux.InferAction<typeof config.actions.updateInState> = action;
      const existing = redux.reducers.findModelInData(state.data, a.payload.id, { action: a });
      if (isNil(existing)) {
        return state;
      }
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { id: _, ...withoutId } = a.payload.data;
      return {
        ...state,
        data: util.replaceInArray<M>(state.data, { id: a.payload.id }, { ...existing, ...withoutId })
      };
    } else if (!isNil(config.actions.addToState) && action.type === config.actions.addToState.toString()) {
      const a: Redux.InferAction<typeof config.actions.addToState> = action;
      const existing = redux.reducers.findModelInData(state.data, a.payload.id, { warnOnMissing: false });
      if (!isNil(existing)) {
        notifications.inconsistentStateError({
          action: a,
          reason: "Instance already exists in state when it is not expected to."
        });
        return state;
      }
      return { ...state, data: [...state.data, a.payload], count: state.count + 1 };
    } else if (!isNil(config.actions.updateOrdering) && action.type === config.actions.updateOrdering.toString()) {
      const a: Redux.InferAction<typeof config.actions.updateOrdering> = action;
      const existing: Http.FieldOrder<string> | undefined = find(state.ordering, { field: a.payload.field });
      if (isNil(existing)) {
        notifications.inconsistentStateError({
          action: a,
          reason: "Ordering for field does not exist in state when it is expected to."
        });
        return state;
      }
      return {
        ...state,
        ordering: reduce(
          state.ordering,
          (curr: Http.Ordering<string>, o: Http.FieldOrder<string>) => {
            if (o.field === a.payload.field) {
              return [...curr, { ...o, order: a.payload.order }];
            }
            return [...curr, { ...o, order: 0 }];
          },
          []
        )
      };
    } else if (!isNil(config.actions.setPagination) && action.type === config.actions.setPagination.toString()) {
      const a: Redux.InferAction<typeof config.actions.setPagination> = action;
      return !isNil(a.payload.pageSize)
        ? { ...state, page: a.payload.page, pageSize: a.payload.pageSize }
        : { ...state, page: a.payload.page };
    } else if (!isNil(config.actions.deleting) && action.type === config.actions.deleting.toString()) {
      const a: Redux.InferAction<typeof config.actions.deleting> = action;
      return { ...state, deleting: redux.reducers.modelListActionReducer(state.deleting, a) };
    } else if (!isNil(config.actions.updating) && action.type === config.actions.updating.toString()) {
      const a: Redux.InferAction<typeof config.actions.updating> = action;
      return { ...state, updating: redux.reducers.modelListActionReducer(state.updating, a) };
    } else if (!isNil(config.actions.creating) && action.type === config.actions.creating.toString()) {
      const a: Redux.InferAction<typeof config.actions.creating> = action;
      return { ...state, creating: a.payload };
    }
    return state;
  };

export const createAuthenticatedModelListResponseReducer = <
  M extends Model.HttpModel,
  P extends Redux.ActionPayload = null,
  C extends Table.Context = Table.Context,
  S extends Redux.AuthenticatedModelListResponseStore<M> = Redux.AuthenticatedModelListResponseStore<M>,
  A extends Redux.TableAction<P, C> = Redux.TableAction<P, C>
>(
  config: Redux.ReducerConfig<S, Partial<Redux.AuthenticatedModelListResponseActionMap<M, P, C>>>
): Redux.Reducer<S, A> => {
  const reducer = createModelListResponseReducer<M, P, S, A>(config);
  return withAuthentication<M, P, C, S, A>(reducer, config);
};
