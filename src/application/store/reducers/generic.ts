import { logger } from "internal";
import { model } from "lib";

import * as types from "../types";

export const identityReducer =
  <S, A extends types.Action = types.Action>(initialState: S): types.Reducer<S, A> =>
  (st: S = initialState) =>
    st;

export const identityReducerWithDefinedState = <S>(st: S) => st;

export const modelListActionReducer = <M extends model.Model = model.Model>(
  st: types.ModelListActionStore<M> = { current: [], completed: [], failed: [] },
  action: types.ModelListActionAction<M>,
): types.ModelListActionStore<M> => {
  if (action.value === true) {
    if (!st.current.includes(action.id)) {
      return { ...st, current: [...st.current, action.id] };
    }
    logger.inconsistentReduxStateError(
      {
        action: "Adding to model list action state.",
      },
      "The instance already exists in state when it is expected to.",
    );
    return st;
  } else {
    if (st.current.includes(action.id)) {
      return {
        ...st,
        current: st.current.filter((id: M["id"]) => id !== action.id),
        failed: action.success === false ? [...st.failed, action.id] : st.failed,
        completed: action.success !== false ? [...st.completed, action.id] : st.completed,
      };
    }
    logger.inconsistentReduxStateError(
      {
        action: "Removing from model list action state.",
      },
      "The instance does not exist in state when it is expected to.",
    );
    return st;
  }
};

export const withActionsOnly =
  <S, A extends types.BasicAction = types.BasicAction>(
    reducer: types.BasicReducer<S, A>,
    initialState: S,
    actions: A["type"][],
  ): types.BasicReducer<S, A> =>
  (s: S | undefined = initialState, a: A): S =>
    !actions.includes(a.type) ? s : reducer(s, a);
