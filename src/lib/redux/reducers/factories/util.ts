import { Reducer } from "redux";
import { forEach, isNil, reduce } from "lodash";
import { util } from "lib";

export const mergeOptionsWithDefaults = <O extends Redux.ActionMap, S, A extends Redux.Action<any> = Redux.Action<any>>(
  options: Partial<Redux.FactoryOptions<O, S, A>>,
  initialState: S
): Redux.FactoryOptions<O, S, A> => {
  return {
    initialState: initialState,
    subReducers: null,
    strictSelect: true,
    extension: null,
    extensions: null,
    excludeActions: null,
    ...options
  };
};

const findReducerForAction = <O extends Redux.ActionMap, S, A extends Redux.Action<any> = Redux.Action<any>>(
  /* eslint-disable indent */
  action: A,
  mappings: Partial<O>,
  reducers: Redux.MappedReducers<O, S, A>
): Reducer<S, A> | undefined => {
  // Find the standardized action type that the associated action maps to based
  // on the provided mappings.
  let standardizedActionType: string | undefined = undefined;
  forEach(mappings, (value: string | undefined, standard: string) => {
    if (value !== undefined && value === action.type) {
      standardizedActionType = standard;
      return false;
    }
  });
  if (!isNil(standardizedActionType)) {
    const reducer: Reducer<S, A> | undefined = reducers[standardizedActionType];
    return reducer;
  }
  return undefined;
};

export const createSimpleReducerFromMap =
  <O extends Redux.ActionMap, S, A extends Redux.Action<any> = Redux.Action<any>>(
    /* eslint-disable indent */
    mappings: Partial<O>,
    reducers: Redux.MappedReducers<O, S, A>,
    options: Redux.FactoryOptions<O, S, A>
  ): Reducer<S, A> =>
  (state: S = options.initialState, action: A): S => {
    const actionReducer = findReducerForAction<O, S, A>(action, mappings, reducers);
    if (!isNil(actionReducer)) {
      return actionReducer(state, action);
    }
    return state;
  };

export const createObjectReducerFromMap = <
  O extends Redux.ActionMap,
  S extends object,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  mappings: Partial<O>,
  transformers: Redux.MappedReducers<O, S, A>,
  options: Redux.FactoryOptions<O, S, A>
): Reducer<S, A> => {
  const reducer: Reducer<S, A> = (state: S = options.initialState, action: A): S => {
    let newState = { ...state };
    let reducers = { ...transformers, ...options.overrides };

    const actionReducer = findReducerForAction<O, S, A>(action, mappings, reducers);
    if (!isNil(actionReducer)) {
      // If the action is being filtered out of the reducer, do not update the state.
      if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
        newState = actionReducer(newState, action);
      }
    } else {
      if (!isNil(options.extensions) && !isNil(options.extensions[action.type])) {
        if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
          newState = options.extensions[action.type](newState, action);
        }
      }
    }
    if (!isNil(options.subReducers)) {
      forEach(options.subReducers, (subReducer: Reducer<any, A>, stateDirective: string) => {
        const subState = util.getKeyValue<S, keyof S>(stateDirective as keyof S)(newState);
        if (!isNil(subState)) {
          newState = { ...newState, [stateDirective]: subReducer(subState, action) };
        }
      });
    }
    // If the reducer is provided with an extension reducer, apply the entire extension reducer to
    // the action and state.
    if (!isNil(options.extension)) {
      if (Array.isArray(options.extension)) {
        newState = reduce(options.extension, (st: S, ext: Reducer<S, A>) => ext(st, action), newState);
      } else {
        newState = options.extension(newState, action);
      }
    }
    return newState;
  };
  return reducer;
};
