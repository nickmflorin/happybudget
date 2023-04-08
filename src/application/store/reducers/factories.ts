import { find, uniq } from "lodash";

import { logger } from "internal";
import { notifications, model, replaceInArray, SingleOrArray } from "lib";

import * as api from "../../api";
import * as types from "../types";

import { modelListActionReducer } from "./generic";

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a generic value, {@link P}, that is set directly from the payload,
 * {@link types.ActionPayload}, of the dispatched action, {@link types.Action<P>}.
 *
 * @param {types.ReducerConfig<P, { set: P }, C>} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 *
 * @returns {types.Reducer<P, types.Action<P, C>>}
 */
export const createSimplePayloadReducer =
  <P, C extends types.ActionContext = types.ActionContext>(
    config: types.ReducerConfig<P, { set: P }, C>,
  ): types.Reducer<P, types.ActionFromPayloadMap<{ set: P }, C>> =>
  (state: P = config.initialState, action: types.ActionFromPayloadMap<{ set: P }, C>): P => {
    if (config.actions.set?.toString() === action.type) {
      const a: types.Action<P, C> = action;
      return a.payload;
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a boolean value, {@link boolean}.
 *
 * @param {Omit<types.ReducerConfig<boolean, { set: boolean }>, "initialState">} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 *
 * @returns {types.Reducer<boolean, types.Action<boolean>>}
 */
export const createSimpleBooleanReducer = (
  config: Omit<types.ReducerConfig<boolean, { set: boolean }>, "initialState">,
): types.Reducer<boolean, types.Action<boolean>> =>
  createSimplePayloadReducer<boolean>({ ...config, initialState: false });

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a toggleable boolean value, {@link boolean}.
 *
 * @param {Omit<types.ReducerConfig<boolean, { set: boolean | "TOGGLE" }>, "initialState">} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 *
 * @returns {types.Reducer<boolean, types.Action<boolean | "TOGGLE">>}
 */
export const createSimpleBooleanToggleReducer =
  (
    config: Omit<types.ReducerConfig<boolean, { set: boolean | "TOGGLE" }>, "initialState">,
  ): types.Reducer<boolean, types.Action<boolean | "TOGGLE">> =>
  (state = false, action: types.Action<boolean | "TOGGLE">) => {
    if (config.actions.set?.toString() === action.type) {
      if (typeof action.payload === "string") {
        return !state;
      }
      return action.payload;
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a model's detail - where a detail is considered the information related
 * to a specific instance of a model,
 * {@link model.ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createDetailReducer =
  <
    M extends model.ApiModel,
    C extends types.ActionContext = types.ActionContext,
    S extends types.ApiModelDetailStore<M> = types.ApiModelDetailStore<M>,
    MP extends types.ModelDetailActionPayloadMap<M> = types.ModelDetailActionPayloadMap<M>,
  >(
    config: types.ReducerConfig<S, MP, C>,
  ): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> =>
  (state: S = config.initialState, action: types.ActionFromPayloadMap<MP, C>): S => {
    if (
      config.actions.response !== undefined &&
      action.type === config.actions.response.toString()
    ) {
      const a = action as types.Action<MP["response"], C>;
      const { response, error } = a.payload;
      if (error) {
        return { ...state, data: null, error, invalidated: false };
      }
      return { ...state, data: response, error: null, invalidated: false };
    } else if (
      config.actions.loading !== undefined &&
      action.type === config.actions.loading.toString()
    ) {
      const a = action as types.Action<MP["loading"], C>;
      return { ...state, loading: a.payload };
    } else if (
      config.actions.updateInState !== undefined &&
      action.type === config.actions.updateInState.toString()
    ) {
      const a = action as types.Action<MP["updateInState"], C>;
      return { ...state, data: { ...state.data, ...a.payload.data } };
    } else if (
      config.actions.invalidate !== undefined &&
      action.type === config.actions.invalidate.toString()
    ) {
      return { ...state, invalidated: true };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a series of entities, {@link M}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createListReducer =
  <
    M extends api.ListResponseIteree,
    C extends types.ActionContext = types.ActionContext,
    S extends types.ListStore<M> = types.ListStore<M>,
    MP extends Omit<types.ListActionPayloadMap<M>, "request"> = Omit<
      types.ListActionPayloadMap<M>,
      "request"
    >,
  >(
    config: types.ReducerConfig<S, MP>,
  ): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> =>
  (state: S = config.initialState, action: types.ActionFromPayloadMap<MP, C>): S => {
    if (config.actions.loading !== undefined && action.type === config.actions.loading.toString()) {
      const a = action as types.Action<MP["loading"], C>;
      return { ...state, loading: a.payload };
    } else if (
      config.actions.response !== undefined &&
      action.type === config.actions.response.toString()
    ) {
      const a = action as types.Action<MP["response"], C>;
      const { response, error, requestMeta } = a.payload;
      const newState: S = {
        ...state,
        responseWasReceived: true,
        query: requestMeta.query,
      };
      if (error) {
        return { ...newState, error, data: [], count: 0, invalidated: false };
      }
      return {
        ...state,
        error: null,
        data: response.data,
        count: response.count,
        invalidated: false,
      };
    } else if (
      config.actions.invalidate !== undefined &&
      action.type === config.actions.invalidate.toString()
    ) {
      return { ...state, invalidated: true };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a series of model details - where a detail is considered the information
 * related to a specific instance of a model, {@link model.ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createModelListReducer = <
  M extends model.ApiModel,
  C extends types.ActionContext = types.ActionContext,
  S extends types.ApiModelListStore<M> = types.ApiModelListStore<M>,
  MP extends types.ApiModelListActionPayloadMap<M> = types.ApiModelListActionPayloadMap<M>,
>(
  config: types.ReducerConfig<S, MP>,
): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> => createListReducer<M, C, S, MP>(config);

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a series of model details for an authenticated user - where a detail is
 * considered the information related to a specific instance of a model, {@link model.ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createAuthenticatedModelListReducer = <
  M extends model.ApiModel,
  C extends types.ActionContext = types.ActionContext,
  S extends types.AuthenticatedApiModelListStore<M> = types.AuthenticatedApiModelListStore<M>,
  /* eslint-disable-next-line max-len */
  MP extends types.AuthenticatedApiModelListActionPayloadMap<M> = types.AuthenticatedApiModelListActionPayloadMap<M>,
>(
  config: types.ReducerConfig<S, MP>,
): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> => {
  const unauthenticatedReducer = createModelListReducer<M, C, S>(
    config as types.ReducerConfig<S, MP, C>,
  );
  return (state: S = config.initialState, action: types.ActionFromPayloadMap<MP, C>): S => {
    if (
      (config.actions.loading !== undefined && action.type === config.actions.loading.toString()) ||
      (config.actions.response !== undefined &&
        action.type === config.actions.response.toString()) ||
      (config.actions.invalidate !== undefined &&
        action.type === config.actions.invalidate.toString())
    ) {
      const a = action as types.Action<MP["loading" | "response" | "invalidate"], C>;
      state = unauthenticatedReducer(state, a);
    }

    const reorderIfApplicable = (s: S) =>
      s.ordering.length !== 0
        ? {
            ...s,
            data: model.orderModelsBy(s.data, s.ordering, action.user || null),
          }
        : s;

    if (
      config.actions.setSearch !== undefined &&
      action.type === config.actions.setSearch.toString()
    ) {
      const a = action as types.Action<MP["setSearch"], C>;
      return { ...state, search: a.payload };
    } else if (
      config.actions.request !== undefined &&
      action.type === config.actions.request.toString()
    ) {
      return { ...state, data: [], count: 0 };
    } else if (
      config.actions.removeFromState !== undefined &&
      action.type === config.actions.removeFromState.toString()
    ) {
      const a = action as types.Action<MP["removeFromState"], C>;
      const existing = model.getModelInState(state.data, a.payload, { action });
      if (existing === null) {
        return state;
      }
      return {
        ...state,
        data: state.data.filter((entity: M) => entity.id !== action.payload),
        count: state.count - 1,
      };
    } else if (
      config.actions.updateInState !== undefined &&
      action.type === config.actions.updateInState.toString()
    ) {
      const a = action as types.Action<MP["updateInState"], C>;
      /* Note: Eventually we will want to apply `reorderIfApplicable` here but we need to make sure
         it is fully properly functioning before we do so. */
      const existing = model.getModelInState(state.data, a.payload.id, { action });
      if (existing === null) {
        return state;
      }
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { id: _, ...withoutId } = a.payload.data;
      return {
        ...state,
        data: replaceInArray<M>(state.data, (m: M) => m.id === a.payload.id, {
          ...existing,
          ...withoutId,
        }),
      };
    } else if (
      config.actions.addToState !== undefined &&
      action.type === config.actions.addToState.toString()
    ) {
      const a = action as types.Action<MP["addToState"], C>;
      const existing = model.getModelInState(state.data, a.payload.id, {
        warnOnMissing: false,
      });
      if (existing !== undefined) {
        notifications.internal.inconsistentStateError({
          action,
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
      config.actions.updateOrdering !== undefined &&
      action.type === config.actions.updateOrdering.toString()
    ) {
      const a = action as types.Action<MP["updateOrdering"], C>;
      const existing: api.FieldOrder<string & keyof M> | undefined = find(state.ordering, {
        field: a.payload.field as keyof M & string,
      }) as api.FieldOrder<string & keyof M> | undefined;
      if (existing !== undefined) {
        notifications.internal.inconsistentStateError({
          action,
          reason: "Ordering for field does not exist in state when it is expected to.",
        });
        return state;
      }
      return {
        ...state,
        ordering: state.ordering.reduce(
          (curr: api.ModelOrdering<M>, o: api.ModelFieldOrder<M>): api.ModelOrdering<M> => {
            if (o.field === a.payload.field) {
              return [...curr, { ...o, order: a.payload.order }];
            }
            return [...curr, { ...o, order: 0 }];
          },
          [] as api.ModelOrdering<M>,
        ),
      };
    } else if (
      config.actions.setPagination !== undefined &&
      action.type === config.actions.setPagination.toString()
    ) {
      const a = action as types.Action<MP["setPagination"], C>;
      return a.payload.pageSize !== undefined
        ? { ...state, page: a.payload.page, pageSize: a.payload.pageSize }
        : { ...state, page: a.payload.page };
    } else if (
      config.actions.deleting !== undefined &&
      action.type === config.actions.deleting.toString()
    ) {
      const a = action as types.Action<MP["deleting"], C>;
      return { ...state, deleting: modelListActionReducer(state.deleting, a.payload) };
    } else if (
      config.actions.updating !== undefined &&
      action.type === config.actions.updating.toString()
    ) {
      const a = action as types.Action<MP["updating"], C>;
      return { ...state, updating: modelListActionReducer(state.updating, a.payload) };
    } else if (
      config.actions.creating !== undefined &&
      action.type === config.actions.creating.toString()
    ) {
      const a = action as types.Action<MP["creating"], C>;
      return { ...state, creating: a.payload };
    }
    return state;
  };
};

type ModelIndexedReducerConfig<S, A extends types.Action = types.Action> = {
  readonly initialState: S;
  readonly getId: (a: A) => number;
  readonly includeAction?: (a: A) => boolean;
};

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining an indexed store of state.
 *
 * @param {types.Reducer<S, A>} reducer
 *   The reducer that handles the state at each indexed location.
 *
 * @param {types.ModelIndexedReducerConfig<S, A>} config
 *   Configuration for the created reducer, {@link types.Reducer}.
 */
export const createModelIndexedReducer =
  <S, A extends types.Action = types.Action>(
    reducer: types.Reducer<S, A>,
    config: ModelIndexedReducerConfig<S, A>,
  ): types.Reducer<types.ModelIndexedStore<S>, A> =>
  (state: types.ModelIndexedStore<S> | undefined = {}, a: A): types.ModelIndexedStore<S> => {
    if (config.includeAction === undefined || config.includeAction(a) === true) {
      const id = config.getId(a);
      /* Even though this should not happen, and it is typed to not happen, it has happened - and
         can lead to strange behavior without a clear indication of what the root cause was. */
      if (typeof id !== "number") {
        logger.error(`Invalid ID ${String(id)} received for indexed store reducer!`);
        return state;
      }
      if (state[id] === undefined) {
        state[id] = config.initialState;
      }
      return { ...state, [id]: reducer(state[id], a) };
    }
    return state;
  };

export type SelectAction<M extends model.Model> = types.BasicAction<
  SingleOrArray<M["id"]>,
  "SELECT"
>;
export type DeselectAction<M extends model.Model> = types.BasicAction<
  SingleOrArray<M["id"]>,
  "DESELECT"
>;
export type ToggleAction<M extends model.Model> = types.BasicAction<
  SingleOrArray<M["id"]>,
  "TOGGLE"
>;
export type SelectionAction<M extends model.Model> =
  | SelectAction<M>
  | DeselectAction<M>
  | ToggleAction<M>;

export type SelectionState<M extends model.Model> = M["id"][];

export type SelectionHandlers<M extends model.Model> = {
  readonly select: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly deselect: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly toggle: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
};

export const createSelectionHandlers = <M extends model.Model>(
  mode: ModelSelectionMode,
): SelectionHandlers<M> => {
  type S = SelectionState<M>;

  const select = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return id.reduce((prev: S, i: M["id"]) => select(prev, i), s);
    } else if (s.includes(id)) {
      logger.warn(`Model ${id} is already in the selected state.`);
      return s;
    } else if (mode === "multiple") {
      return [...s, id];
    } else {
      return [id];
    }
  };

  const deselect = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return id.reduce((prev: S, i: M["id"]) => deselect(prev, i), s);
    } else if (!s.includes(id)) {
      logger.warn(`Model ${id} is not in the selected state.`);
      return s;
    } else if (mode === "multiple") {
      return s.filter((i: M["id"]) => i !== id);
    } else {
      return [];
    }
  };

  const toggle = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return id.reduce((prev: S, i: M["id"]) => toggle(prev, i), s);
    } else if (!s.includes(id)) {
      return select(s, id);
    } else {
      return deselect(s, id);
    }
  };

  return { select, deselect, toggle };
};

export const createSelectionReducer = <M extends model.Model>(
  mode: ModelSelectionMode,
  initialState: SelectionState<M>,
): types.BasicReducer<M["id"][], SelectionAction<M>> => {
  const handlers = createSelectionHandlers<M>(mode);
  return (state: M["id"][] = initialState, action: SelectionAction<M>) => {
    const ids = uniq(Array.isArray(action.payload) ? action.payload : [action.payload]);
    if (action.type === "SELECT") {
      return handlers.select(state, ids);
    } else if (action.type === "DESELECT") {
      return handlers.deselect(state, ids);
    } else if (action.type === "TOGGLE") {
      return handlers.toggle(state, ids);
    }
    return state;
  };
};
