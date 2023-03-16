import { isNil, filter, find, reduce } from "lodash";

import { http, notifications, util } from "lib";

import { modelListActionReducer } from "./reducers";
import { findModelInData } from "../util";

export const createSimplePayloadReducer =
  <P extends Redux.ActionPayload>(
    config: Redux.ReducerConfig<P, { set: Redux.ActionCreator<P> }>,
  ): Redux.Reducer<P> =>
  (state: P = config.initialState, action: Redux.Action<P>): P => {
    if (config.actions.set?.toString() === action.type) {
      return action.payload;
    }
    return state;
  };

export const createSimpleBooleanReducer = (
  config: Omit<Redux.ReducerConfig<boolean, { set: Redux.ActionCreator<boolean> }>, "initialState">,
): Redux.Reducer<boolean> =>
  createSimplePayloadReducer<boolean>({ ...config, initialState: false });

export const createSimpleBooleanToggleReducer =
  (
    config: Omit<
      Redux.ReducerConfig<boolean, { set: Redux.ActionCreator<boolean | "TOGGLE"> }>,
      "initialState"
    >,
  ): Redux.Reducer<boolean> =>
  (state = false, action: Redux.Action<boolean | "TOGGLE">) => {
    if (config.actions.set?.toString() === action.type) {
      if (typeof action.payload === "string") {
        return !state;
      }
      return action.payload;
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * detail response - where a detail response might be the response received
 * from submitting an API request to /entity/<pk>/.
 *
 * @param config  The Redux.ReducerConfig object that contains information about
 *                the behavior of the reducer returned from the factory.
 */
export const createDetailReducer =
  <
    M extends Model.HttpModel,
    C extends Redux.ActionContext = Redux.ActionContext,
    A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
    S extends Redux.ModelDetailStore<M> = Redux.ModelDetailStore<M>,
  >(
    config: Redux.ReducerConfig<
      S,
      Redux.ActionCreatorMap<Redux.ModelDetailActionPayloadMap<M>, C>,
      C
    >,
  ): Redux.Reducer<S, C, A> =>
  (state: S = config.initialState, action: A): S => {
    if (!isNil(config.actions.response) && action.type === config.actions.response.toString()) {
      const a: Redux.InferAction<typeof config.actions.response> = action;
      if (http.detailResponseFailed(a.payload)) {
        return { ...state, data: null, error: a.payload.error, invalidated: false };
      }
      return { ...state, data: a.payload, error: null, invalidated: false };
    } else if (
      !isNil(config.actions.loading) &&
      action.type === config.actions.loading.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.loading> = action;
      return { ...state, loading: a.payload };
    } else if (
      !isNil(config.actions.updateInState) &&
      action.type === config.actions.updateInState.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.updateInState> = action;
      return { ...state, data: { ...state.data, ...a.payload.data } };
    } else if (
      !isNil(config.actions.invalidate) &&
      action.type === config.actions.invalidate.toString()
    ) {
      return { ...state, invalidated: true };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer to handle the read only
 * state of a list response, where a list response might be the response
 * received from submitting an API request to /entity/.
 *
 * @param config  The Redux.ReducerConfig object that contains information about
 *                the behavior of the reducer returned from the factory.
 */
export const createListReducer =
  <
    M,
    C extends Redux.ActionContext = Redux.ActionContext,
    A extends Redux.Action<Redux.ActionPayload, C> = Redux.Action<Redux.ActionPayload, C>,
    S extends Redux.ListStore<M> = Redux.ListStore<M>,
  >(
    config: Redux.ReducerConfig<S, Omit<Redux.ListActionCreatorMap<M, C>, "request">, C>,
  ): Redux.Reducer<S, C, A> =>
  (state: S = config.initialState, action: A): S => {
    if (!isNil(config.actions.loading) && action.type === config.actions.loading.toString()) {
      const a: Redux.InferAction<typeof config.actions.loading> = action;
      return { ...state, loading: a.payload };
    } else if (
      !isNil(config.actions.response) &&
      action.type === config.actions.response.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.response> = action;
      const newState: S = { ...state, responseWasReceived: true, query: a.payload.query };
      if (http.listResponseFailed<M>(a.payload)) {
        return { ...newState, error: a.payload.error, data: [], count: 0, invalidated: false };
      }
      return {
        ...state,
        error: null,
        data: a.payload.data,
        count: a.payload.count,
        invalidated: false,
      };
    } else if (
      !isNil(config.actions.invalidate) &&
      action.type === config.actions.invalidate.toString()
    ) {
      return { ...state, invalidated: true };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer to handle the read only
 * state of a model list response, where the model list response might be
 * received from submitting an API request to /entity/ where entity is an
 * HttpModel.
 *
 * @param config  The Redux.ReducerConfig object that contains information about
 *                the behavior of the reducer returned from the factory.
 */
export const createModelListReducer = <
  M extends Model.HttpModel,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
  S extends Redux.ModelListStore<M> = Redux.ModelListStore<M>,
>(
  config: Redux.ReducerConfig<S, Redux.ModelListActionCreatorMap<M, C>, C>,
): Redux.Reducer<S, C, A> => createListReducer<M, C, A, S>(config);

const withAuthentication =
  <
    M extends Model.HttpModel,
    C extends Redux.ActionContext = Redux.ActionContext,
    A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
    S extends Redux.AuthenticatedModelListStore<M> = Redux.AuthenticatedModelListStore<M>,
  >(
    reducer: Redux.Reducer<S, C, A>,
    config: Redux.ReducerConfig<S, Redux.AuthenticatedModelListActionCreatorMap<M, C>, C>,
  ): Redux.Reducer<S, C, A> =>
  (state: S = config.initialState, action: A): S => {
    state = reducer(state, action);

    const reorderIfApplicable = (s: S) => {
      if (s.ordering.length !== 0) {
        return {
          ...s,
          data: http.orderBy(s.data, s.ordering, action.user || null),
        };
      }
      return s;
    };

    if (!isNil(config.actions.setSearch) && action.type === config.actions.setSearch.toString()) {
      const a: Redux.InferAction<typeof config.actions.setSearch> = action;
      return { ...state, search: a.payload };
    } else if (
      !isNil(config.actions.request) &&
      action.type === config.actions.request.toString()
    ) {
      return { ...state, data: [], count: 0 };
    } else if (
      !isNil(config.actions.removeFromState) &&
      action.type === config.actions.removeFromState.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.removeFromState> = action;
      const existing = findModelInData(state.data, a.payload, { action: a });
      if (isNil(existing)) {
        return state;
      }
      return {
        ...state,
        data: filter(state.data, (entity: M) => entity.id !== a.payload),
        count: state.count - 1,
      };
    } else if (
      !isNil(config.actions.updateInState) &&
      action.type === config.actions.updateInState.toString()
    ) {
      /* Note: Eventually we will want to apply `reorderIfApplicable` here but
         we need to make sure it is fully properly functioning before we do so. */
      const a: Redux.InferAction<typeof config.actions.updateInState> = action;
      const existing = findModelInData(state.data, a.payload.id, { action: a });
      if (isNil(existing)) {
        return state;
      }
      const { id: _, ...withoutId } = a.payload.data;
      return {
        ...state,
        data: util.replaceInArray<M>(
          state.data,
          { id: a.payload.id },
          { ...existing, ...withoutId },
        ),
      };
    } else if (
      !isNil(config.actions.addToState) &&
      action.type === config.actions.addToState.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.addToState> = action;
      const existing = findModelInData(state.data, a.payload.id, { warnOnMissing: false });
      if (!isNil(existing)) {
        notifications.internal.inconsistentStateError({
          action: a,
          reason: "Instance already exists in state when it is not expected to.",
        });
        return state;
      }
      return reorderIfApplicable({
        ...state,
        data: [...state.data, a.payload],
        count: state.count + 1,
      });
    } else if (
      !isNil(config.actions.updateOrdering) &&
      action.type === config.actions.updateOrdering.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.updateOrdering> = action;
      const existing: Http.FieldOrder<string & keyof M> | undefined = find(state.ordering, {
        field: a.payload.field as keyof M & string,
      }) as Http.FieldOrder<string & keyof M> | undefined;
      if (isNil(existing)) {
        notifications.internal.inconsistentStateError({
          action: a,
          reason: "Ordering for field does not exist in state when it is expected to.",
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
          [],
        ),
      };
    } else if (
      !isNil(config.actions.setPagination) &&
      action.type === config.actions.setPagination.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.setPagination> = action;
      return !isNil(a.payload.pageSize)
        ? { ...state, page: a.payload.page, pageSize: a.payload.pageSize }
        : { ...state, page: a.payload.page };
    } else if (
      !isNil(config.actions.deleting) &&
      action.type === config.actions.deleting.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.deleting> = action;
      return { ...state, deleting: modelListActionReducer(state.deleting, a.payload) };
    } else if (
      !isNil(config.actions.updating) &&
      action.type === config.actions.updating.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.updating> = action;
      return { ...state, updating: modelListActionReducer(state.updating, a.payload) };
    } else if (
      !isNil(config.actions.creating) &&
      action.type === config.actions.creating.toString()
    ) {
      const a: Redux.InferAction<typeof config.actions.creating> = action;
      return { ...state, creating: a.payload };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer to handle the read and
 * write states of a model list response, where the model list response might be
 * received from submitting an API request to /entity/ where entity is an
 * HttpModel.
 *
 * @param config  The Redux.ReducerConfig object that contains information about
 *                the behavior of the reducer returned from the factory.
 */
export const createAuthenticatedModelListReducer = <
  M extends Model.HttpModel,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
  S extends Redux.AuthenticatedModelListStore<M> = Redux.AuthenticatedModelListStore<M>,
>(
  config: Redux.ReducerConfig<S, Redux.AuthenticatedModelListActionCreatorMap<M, C>, C>,
): Redux.Reducer<S, C, A> => {
  const reducer = createModelListReducer<M, C, A, S>(config);
  return withAuthentication<M, C, A, S>(reducer, config);
};

type ModelIndexedReducerConfig<
  S,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
> = {
  readonly initialState: S;
  readonly getId: (a: A) => number;
  readonly includeAction?: (a: A) => boolean;
};

/**
 * A reducer factory that creates a generic reducer to handle a state that is
 * indexed by a model ID, and each state indexed at that ID pertains to the
 * specific model the indexed ID refers to.
 *
 * @param reducer  The reducer that handles the state at each indexed location.
 * @param config   The Redux.ModelIndexedReducerConfig object that contains
 *                 information about the behavior of the reducer returned from
 *                 the factory.
 */
export const createModelIndexedReducer =
  <
    S,
    C extends Redux.ActionContext = Redux.ActionContext,
    A extends Redux.AnyPayloadAction<C> = Redux.AnyPayloadAction<C>,
  >(
    reducer: Redux.Reducer<S, C, A>,
    config: ModelIndexedReducerConfig<S, C, A>,
  ): Redux.Reducer<Redux.ModelIndexedStore<S>, C, A> =>
  (state: Redux.ModelIndexedStore<S> | undefined = {}, a: A): Redux.ModelIndexedStore<S> => {
    if (isNil(config.includeAction) || config.includeAction(a) === true) {
      const id = config.getId(a);
      /*
			Even though this should not happen, and it is typed to not happen, it
			has happened - and can lead to strange behavior without a clear
			indication of what the root cause was. */
      if (typeof id !== "number") {
        console.error(`Invalid ID ${String(id)} received for indexed store reducer!`);
        return state;
      }
      if (isNil(state[id])) {
        state[id] = config.initialState;
      }
      return { ...state, [id]: reducer(state[id], a) };
    }
    return state;
  };
