import { find, uniq } from "lodash";

import { logger } from "internal";
import { getModelInState } from "lib/model/lookup";
import { orderModelsBy } from "lib/model/ordering";
import { Model, ApiModel } from "lib/model/types";
import { ModelSelectionMode } from "lib/ui/types";
import { replaceInArray } from "lib/util/arrays";
import { SingleOrArray } from "lib/util/types/arrays";

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
 * {@link ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createDetailReducer =
  <
    M extends ApiModel,
    C extends types.ActionContext = types.ActionContext,
    S extends types.ApiModelDetailStore<M> = types.ApiModelDetailStore<M>,
    MP extends Partial<types.ModelDetailActionPayloadMap<M>> = Partial<
      types.ModelDetailActionPayloadMap<M>
    >,
  >(
    c: types.ReducerConfig<S, MP, C>,
  ): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> =>
  (state: S = c.initialState, action: types.ActionFromPayloadMap<MP, C>): S => {
    const actions: types.ActionCreatorMap<MP, C> = c.actions;
    if (types.actionQualifiesMap(actions, "response", action)) {
      const { response, error } = action.payload;
      if (error) {
        return { ...state, data: null, error, invalidated: false };
      }
      return { ...state, data: response, error: null, invalidated: false };
    } else if (types.actionQualifiesMap(actions, "loading", action)) {
      return { ...state, loading: action.payload };
    } else if (types.actionQualifiesMap(actions, "updateInState", action)) {
      return { ...state, data: { ...state.data, ...action.payload.data } };
    } else if (types.actionQualifiesMap(actions, "invalidate", action)) {
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
    const actions: types.ActionCreatorMap<MP, C> = config.actions;

    if (types.actionQualifiesMap(actions, "loading", action)) {
      return { ...state, loading: action.payload };
    } else if (types.actionQualifiesMap(actions, "response", action)) {
      const { response, error, requestMeta } = action.payload;
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
    } else if (types.actionQualifiesMap(actions, "invalidate", action)) {
      return { ...state, invalidated: true };
    }
    return state;
  };

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a series of model details - where a detail is considered the information
 * related to a specific instance of a model, {@link ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createModelListReducer = <
  M extends ApiModel,
  C extends types.ActionContext = types.ActionContext,
  S extends types.ApiModelListStore<M> = types.ApiModelListStore<M>,
  MP extends types.ApiModelListActionPayloadMap<M> = types.ApiModelListActionPayloadMap<M>,
>(
  config: types.ReducerConfig<S, MP>,
): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> => createListReducer<M, C, S, MP>(config);

/**
 * A reducer factory that creates a generic reducer, {@link types.Reducer}, capable of handling and
 * maintaining the state of a series of model details for an authenticated user - where a detail is
 * considered the information related to a specific instance of a model, {@link ApiModel}.
 *
 * @param {types.ReducerConfig} config
 *   Configuration for the created reducer, {@link types.Reducer}, that includes the map of action
 *   types to their associated action creators, {@link types.ActionCreator}.
 */
export const createAuthenticatedModelListReducer = <
  M extends ApiModel,
  C extends types.ActionContext = types.ActionContext,
  S extends types.AuthenticatedApiModelListStore<M> = types.AuthenticatedApiModelListStore<M>,
  /* eslint-disable-next-line max-len */
  MP extends types.AuthenticatedApiModelListActionPayloadMap<M> = types.AuthenticatedApiModelListActionPayloadMap<M>,
>(
  config: types.ReducerConfig<S, MP>,
): types.Reducer<S, types.ActionFromPayloadMap<MP, C>> => {
  const unauthenticatedReducer = createModelListReducer<M, C, S, MP>(
    config as types.ReducerConfig<S, MP, C>,
  );
  const actions: types.ActionCreatorMap<MP, C> = config.actions;
  return (state: S = config.initialState, action: types.ActionFromPayloadMap<MP, C>): S => {
    if (
      types.actionQualifiesMap(actions, "loading", action) ||
      types.actionQualifiesMap(actions, "response", action) ||
      types.actionQualifiesMap(actions, "invalidate", action)
    ) {
      state = unauthenticatedReducer(state, action);
    }
    const reorderIfApplicable = (s: S) =>
      s.ordering.length !== 0
        ? {
            ...s,
            data: orderModelsBy(s.data, s.ordering, action.user || null),
          }
        : s;

    if (types.actionQualifiesMap(actions, "setSearch", action)) {
      return { ...state, search: action.payload };
    } else if (types.actionQualifiesMap(actions, "request", action)) {
      return { ...state, data: [], count: 0 };
    } else if (types.actionQualifiesMap(actions, "removeFromState", action)) {
      const existing = getModelInState(state.data, action.payload, { action });
      if (existing === null) {
        return state;
      }
      return {
        ...state,
        data: state.data.filter((entity: M) => entity.id !== action.payload),
        count: state.count - 1,
      };
    } else if (types.actionQualifiesMap(actions, "updateInState", action)) {
      /* Note: Eventually we will want to apply `reorderIfApplicable` here but we need to make sure
         it is fully properly functioning before we do so. */
      const existing = getModelInState(state.data, action.payload.id, { action });
      if (existing === null) {
        return state;
      }
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { id: _, ...withoutId } = action.payload.data;
      return {
        ...state,
        data: replaceInArray<M>(state.data, (m: M) => m.id === action.payload.id, {
          ...existing,
          ...withoutId,
        }),
      };
    } else if (types.actionQualifiesMap(actions, "addToState", action)) {
      const existing = getModelInState(state.data, action.payload.id, {
        warnOnMissing: false,
      });
      if (existing !== undefined) {
        logger.inconsistentReduxStateError(
          { action },
          "Instance already exists in state when it is not expected to.",
        );
        return state;
      }
      return reorderIfApplicable({
        ...state,
        data: [...state.data, action.payload],
        count: state.count + 1,
      });
    } else if (types.actionQualifiesMap(actions, "updateOrdering", action)) {
      const existing: api.FieldOrder<string & keyof M> | undefined = find(state.ordering, {
        field: action.payload.field as keyof M & string,
      }) as api.FieldOrder<string & keyof M> | undefined;
      if (existing !== undefined) {
        logger.inconsistentReduxStateError(
          { action },
          "Ordering for field does not exist in state when it is expected to.",
        );
        return state;
      }
      return {
        ...state,
        ordering: state.ordering.reduce(
          (curr: api.ModelOrdering<M>, o: api.ModelFieldOrder<M>): api.ModelOrdering<M> => {
            if (o.field === action.payload.field) {
              return [...curr, { ...o, order: action.payload.order }];
            }
            return [...curr, { ...o, order: 0 }];
          },
          [] as api.ModelOrdering<M>,
        ),
      };
    } else if (types.actionQualifiesMap(actions, "setPagination", action)) {
      return action.payload.pageSize !== undefined
        ? { ...state, page: action.payload.page, pageSize: action.payload.pageSize }
        : { ...state, page: action.payload.page };
    } else if (types.actionQualifiesMap(actions, "deleting", action)) {
      return { ...state, deleting: modelListActionReducer(state.deleting, action.payload) };
    } else if (types.actionQualifiesMap(actions, "updating", action)) {
      return { ...state, updating: modelListActionReducer(state.updating, action.payload) };
    } else if (types.actionQualifiesMap(actions, "creating", action)) {
      return { ...state, creating: action.payload };
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

export type SelectAction<M extends Model> = types.BasicAction<SingleOrArray<M["id"]>, "SELECT">;
export type DeselectAction<M extends Model> = types.BasicAction<SingleOrArray<M["id"]>, "DESELECT">;
export type ToggleAction<M extends Model> = types.BasicAction<SingleOrArray<M["id"]>, "TOGGLE">;
export type SelectionAction<M extends Model> =
  | SelectAction<M>
  | DeselectAction<M>
  | ToggleAction<M>;

export type SelectionState<M extends Model> = M["id"][];

export type SelectionHandlers<M extends Model> = {
  readonly select: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly deselect: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly toggle: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
};

export const createSelectionHandlers = <M extends Model>(
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

export const createSelectionReducer = <M extends Model>(
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
