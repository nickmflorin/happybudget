import { useReducer, useMemo } from "react";
import { includes, map } from "lodash";
import * as reducers from "./reducers";

type UseSelectionReturnType<M extends Model.Model> = {
  readonly selected: M["id"][];
  readonly select: (id: SingleOrArray<M["id"]>) => void;
  readonly deselect: (id: SingleOrArray<M["id"]>) => void;
  readonly toggle: (id: SingleOrArray<M["id"]>) => void;
};

export const useSelection = <M extends Model.Model>(
  mode: ModelSelectionMode,
  initialState?: M["id"][]
): UseSelectionReturnType<M> => {
  const [store, dispatch] = useReducer(
    reducers.createSelectionReducer<M>(mode, initialState || []),
    initialState || []
  );
  return {
    selected: store,
    select: (id: SingleOrArray<M["id"]>) => dispatch({ type: "SELECT", payload: id }),
    deselect: (id: SingleOrArray<M["id"]>) => dispatch({ type: "DESELECT", payload: id }),
    toggle: (id: SingleOrArray<M["id"]>) => dispatch({ type: "TOGGLE", payload: id })
  };
};

export const useTrackModelActions = (
  initialState?: Redux.ModelListActionStore
): [(id: ID) => boolean, (id: ID) => void, (id: ID) => void, ID[]] => {
  const [store, dispatch] = useReducer(reducers.modelListActionReducer, initialState || []);

  /* The reducer does not care about the action TYPE - just the payload.  So we
		 can put jibberish here, and it wouldn't matter.  But we need to include it
		 for TS to compile, because all of our actions expect a TYPE. */
  const addToState = (id: ID) => dispatch({ type: "NONE", payload: { id, value: true }, context: {} });
  const removeFromState = (id: ID) => dispatch({ type: "NONE", payload: { id, value: false }, context: {} });

  const isDeleting = useMemo(
    () => (id: ID) =>
      includes(
        map(store, (instance: Redux.ModelListActionInstance) => instance.id),
        id
      ),
    [store]
  );

  return [
    isDeleting,
    addToState,
    removeFromState,
    map(store, (instance: Redux.ModelListActionInstance) => instance.id)
  ];
};
