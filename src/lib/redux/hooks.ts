import { useReducer, useMemo } from "react";
import { includes, map } from "lodash";
import * as reducers from "./reducers";

export const useTrackModelActions = (
  initialState?: Redux.ModelListActionStore
): [(id: ID) => boolean, (id: ID) => void, (id: ID) => void, ID[]] => {
  const [store, dispatch] = useReducer(reducers.modelListActionReducer, initialState || []);

  // The reducer does not care about the action TYPE - just the payload.  So we can put
  // jibberish here, and it wouldn't matter.  But we need to include it for TS to compile,
  // because all of our actions expect a TYPE.
  const addToState = (id: ID) => dispatch({ type: "NONE", payload: { id, value: true } });
  const removeFromState = (id: ID) => dispatch({ type: "NONE", payload: { id, value: false } });

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
