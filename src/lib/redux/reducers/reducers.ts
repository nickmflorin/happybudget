import { filter, includes, reduce, uniq } from "lodash";

import { notifications } from "lib";

export const identityReducer =
  <S>(initialState: S): Redux.Reducer<S> =>
  (st: S = initialState) =>
    st;

export const identityReducerWithDefinedState = <S>(st: S) => st;

export const modelListActionReducer = <M extends Model.Model = Model.Model>(
  st: Redux.ModelListActionStore<M> = { current: [], completed: [], failed: [] },
  action: Redux.ModelListActionAction<M>
): Redux.ModelListActionStore<M> => {
  if (action.value === true) {
    if (!includes(st.current, action.id)) {
      return { ...st, current: [...st.current, action.id] };
    }
    notifications.internal.inconsistentStateError({
      action: "Adding to model list action state.",
      reason: "The instance already exists in state when it is expected to."
    });
    return st;
  } else {
    if (includes(st.current, action.id)) {
      return {
        ...st,
        current: filter(st.current, (id: M["id"]) => id !== action.id),
        failed: action.success === false ? [...st.failed, action.id] : st.failed,
        completed: action.success !== false ? [...st.completed, action.id] : st.completed
      };
    }
    notifications.internal.inconsistentStateError({
      action: "Removing from model list action state.",
      reason: "The instance does not exist in state when it is expected to."
    });
    return st;
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

export const withActionsOnly = <S, A extends Redux.Action = Redux.Action>(
  reducer: Redux.Reducer<S, A>,
  initialState: S,
  actions: (Redux.ActionCreator | Redux.TableActionCreator | string)[]
): Redux.Reducer<S, A> => {
  const actionNames = reduce(
    actions,
    (curr: string[], a: Redux.ActionCreator | Redux.TableActionCreator | string) =>
      typeof a === "string" ? [...curr, a] : [...curr, a.toString()],
    []
  );
  /* We have to force coerce to R since the form of the reducer may differ based
     on the optional s? parameter and included initialState initializer:

		 (1) (s: S | undefined = initialState, a: A) => S
		 (2) (s: S, a: A) => S
		 */
  return (s: S | undefined = initialState, a: A): S => {
    if (!includes(actionNames, a.type)) {
      return s;
    }
    return reducer(s, a);
  };
};
