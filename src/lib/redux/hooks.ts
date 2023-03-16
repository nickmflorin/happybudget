import { useReducer, useMemo } from "react";

import { includes } from "lodash";

import * as reducers from "./reducers";

type UseSelectionReturnType<M extends Model.Model> = {
  readonly selected: M["id"][];
  readonly select: (id: SingleOrArray<M["id"]>) => void;
  readonly deselect: (id: SingleOrArray<M["id"]>) => void;
  readonly toggle: (id: SingleOrArray<M["id"]>) => void;
};

export const useSelection = <M extends Model.Model>(
  mode: ModelSelectionMode,
  initialState?: M["id"][],
): UseSelectionReturnType<M> => {
  const [store, dispatch] = useReducer(
    reducers.createSelectionReducer<M>(mode, initialState || []),
    initialState || [],
  );
  return {
    selected: store,
    select: (id: SingleOrArray<M["id"]>) => dispatch({ type: "SELECT", payload: id }),
    deselect: (id: SingleOrArray<M["id"]>) => dispatch({ type: "DESELECT", payload: id }),
    toggle: (id: SingleOrArray<M["id"]>) => dispatch({ type: "TOGGLE", payload: id }),
  };
};

type UseTrackModelActionsReturnType<M extends Model.Model = Model.Model> = {
  readonly isActive: (id: M["id"]) => boolean;
  readonly hasFailed: (id: M["id"]) => boolean;
  readonly hasCompleted: (id: M["id"]) => boolean;
  readonly addToState: (id: M["id"]) => void;
  readonly removeFromState: (id: M["id"], success?: boolean) => void;
  readonly active: M["id"][];
  readonly completed: M["id"][];
  readonly failed: M["id"][];
};

export const useTrackModelActions = <M extends Model.Model = Model.Model>(
  initialState?: Redux.ModelListActionStore<M>["current"],
): UseTrackModelActionsReturnType<M> => {
  const [store, dispatch] = useReducer(reducers.modelListActionReducer, {
    completed: [],
    current: initialState || [],
    failed: [],
  });

  /* The reducer does not care about the action TYPE - just the payload.  So we
		 can put jibberish here, and it wouldn't matter.  But we need to include it
		 for TS to compile, because all of our actions expect a TYPE. */
  const addToState = (id: M["id"]) => dispatch({ id, value: true });
  const removeFromState = (id: M["id"], success?: boolean) =>
    dispatch({ id, value: false, success });

  const isActive = useMemo(() => (id: M["id"]) => includes(store.current, id), [store]);
  const hasFailed = useMemo(() => (id: M["id"]) => includes(store.failed, id), [store]);
  const hasCompleted = useMemo(() => (id: M["id"]) => includes(store.completed, id), [store]);

  return {
    isActive,
    hasFailed,
    hasCompleted,
    addToState,
    removeFromState,
    active: store.current,
    completed: store.completed,
    failed: store.failed,
  };
};
