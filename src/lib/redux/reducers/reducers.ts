import { isNil, filter, find, includes, reduce, uniq } from "lodash";

import { notifications, util } from "lib";

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  (st: S = initialState) =>
    st;

export const identityReducerWithDefinedState = <S>(st: S) => st;

export const modelListActionReducer: Redux.Reducer<
  Redux.ModelListActionStore,
  Redux.Action<Redux.ModelListActionPayload>
> = (
  st: Redux.ModelListActionStore = [],
  action: Redux.Action<Redux.ModelListActionPayload>
): Redux.ModelListActionStore => {
  if (action.payload.value === true) {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (!isNil(instance)) {
      return util.replaceInArray<Redux.ModelListActionInstance>(
        st,
        { id: action.payload.id },
        { ...instance, count: instance.count + 1 }
      );
    } else {
      return [...st, { id: action.payload.id, count: 1 }];
    }
  } else {
    const instance: Redux.ModelListActionInstance | undefined = find(st, { id: action.payload.id });
    if (isNil(instance)) {
      notifications.inconsistentStateError({
        action: "Removing from model list action state.",
        reason: "The instance does not exist in state when it is expected to."
      });
      return st;
    } else {
      if (instance.count === 1) {
        return filter(st, (inst: Redux.ModelListActionInstance) => inst.id !== action.payload.id);
      } else {
        return util.replaceInArray<Redux.ModelListActionInstance>(
          st,
          { id: action.payload.id },
          { ...instance, count: instance.count - 1 }
        );
      }
    }
  }
};

export type SelectAction<M extends Model.Model> = Redux.BasicAction<SingleOrArray<M["id"]>, "SELECT">;
export type DeselectAction<M extends Model.Model> = Redux.BasicAction<SingleOrArray<M["id"]>, "DESELECT">;
export type ToggleAction<M extends Model.Model> = Redux.BasicAction<SingleOrArray<M["id"]>, "TOGGLE">;
export type SelectionAction<M extends Model.Model> = SelectAction<M> | DeselectAction<M> | ToggleAction<M>;

export type SelectionState<M extends Model.Model> = M["id"][];

export type SelectionHandlers<M extends Model.Model> = {
  readonly select: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly deselect: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
  readonly toggle: (s: SelectionState<M>, id: SingleOrArray<M["id"]>) => SelectionState<M>;
};

export const createSelectionHandlers = <M extends Model.Model>(mode: ModelSelectionMode): SelectionHandlers<M> => {
  type S = SelectionState<M>;

  const select = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return reduce(id, (prev: S, i: M["id"]) => select(prev, i), s);
    } else if (includes(s, id)) {
      console.warn(`Model ${id} is already in the selected state.`);
      return s;
    } else if (mode === "multiple") {
      return [...s, id];
    } else {
      return [id];
    }
  };

  const deselect = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return reduce(id, (prev: S, i: M["id"]) => deselect(prev, i), s);
    } else if (!includes(s, id)) {
      console.warn(`Model ${id} is not in the selected state.`);
      return s;
    } else if (mode === "multiple") {
      return filter(s, (i: M["id"]) => i !== id);
    } else {
      return [];
    }
  };

  const toggle = (s: S, id: SingleOrArray<M["id"]>): S => {
    if (Array.isArray(id)) {
      return reduce(id, (prev: S, i: M["id"]) => toggle(prev, i), s);
    } else if (!includes(s, id)) {
      return select(s, id);
    } else {
      return deselect(s, id);
    }
  };

  return { select, deselect, toggle };
};

export const createSelectionReducer = <M extends Model.Model>(
  mode: ModelSelectionMode,
  initialState: SelectionState<M>
): Redux.Reducer<M["id"][], SelectionAction<M>> => {
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
