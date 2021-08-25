import { useReducer, useMemo } from "react";
import { includes, map } from "lodash";
import * as reducers from "./reducers";

export const useTrackModelActions = (
  initialState?: Redux.ModelListActionStore
): [(id: number) => boolean, (id: number) => void, (id: number) => void, number[]] => {
  const [store, dispatch] = useReducer(reducers.modelListActionReducer, initialState || []);

  const addToState = (id: number) => dispatch({ type: "NONE", payload: { id, value: true } });
  const removeFromState = (id: number) => dispatch({ type: "NONE", payload: { id, value: false } });

  const isDeleting = useMemo(
    () => (id: number) =>
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
