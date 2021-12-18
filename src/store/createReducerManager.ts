import { isNil } from "lodash";
import { combineReducers } from "redux";

const createReducerManager = <S extends Application.Store>(
  staticReducers: Redux.ReducersMapObject<S>,
  initialState: S
): Redux.ReducerManager<S> => {
  const reducers = { ...staticReducers };

  let combinedReducer = combineReducers<S, Redux.Action>(reducers);
  let keysToRemove: Table.AsyncId[] = [];

  return {
    getReducerMap: () => reducers,
    reduce: (state: S | undefined = initialState, action: Redux.Action): S => {
      if (keysToRemove.length > 0) {
        state = { ...state };
        for (const key of keysToRemove) {
          delete state[key];
        }
        keysToRemove = [];
      }
      return combinedReducer(state, action);
    },
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    injectReducer: (key: Table.AsyncId, reducer: Redux.Reducer<any>) => {
      if (isNil(reducers[key])) {
        reducers[key as keyof S] = reducer;
        combinedReducer = combineReducers(reducers);
      }
    },
    ejectReducer: (key: Table.AsyncId) => {
      if (!isNil(reducers[key])) {
        delete reducers[key];
        keysToRemove.push(key);
        combinedReducer = combineReducers(reducers);
      }
    }
  };
};

export default createReducerManager;
