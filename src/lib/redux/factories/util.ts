import { Reducer } from "redux";
import { forEach, isNil, reduce } from "lodash";
import { getKeyValue } from "lib/util";
import { MappedReducers, FactoryOptions } from ".";

export const mergeOptionsWithDefaults = <S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  options: Partial<FactoryOptions<S, A>>,
  initialState: S
): FactoryOptions<S, A> => {
  return {
    initialState: initialState,
    references: {},
    subReducers: null,
    strictSelect: true,
    extension: null,
    extensions: null,
    excludeActions: null,
    ...options
  };
};

const findReducerForAction = <P extends { [key: string]: any }, S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  action: A,
  mappings: Partial<P>,
  reducers: MappedReducers<P, S, A>
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

export const createSimpleReducerFromMap = <P, S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  reducers: MappedReducers<P, S, A>,
  options: FactoryOptions<S, A>
): Reducer<S, A> => (state: S = options.initialState, action: A): S => {
  const actionReducer = findReducerForAction<P, S, A>(action, mappings, reducers);
  if (!isNil(actionReducer)) {
    return actionReducer(state, action);
  }
  return state;
};

export const createObjectReducerFromMap = <P, S extends object, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: MappedReducers<P, S, A>,
  options: FactoryOptions<S, A>
): Reducer<S, A> => {
  const reducer: Reducer<S, A> = (state: S = options.initialState, action: A): S => {
    let newState = { ...state };

    const actionReducer = findReducerForAction<P, S, A>(action, mappings, transformers);
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
        const subState = getKeyValue<S, keyof S>(stateDirective as keyof S)(newState);
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

export const createListReducerFromMap = <P, M extends Model, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: MappedReducers<P, Redux.ListStore<M>, A>,
  options: FactoryOptions<Redux.ListStore<M>, A>
): Reducer<Redux.ListStore<M>, A> => {
  const reducer: Reducer<Redux.ListStore<M>, A> = (
    state: Redux.ListStore<M> = options.initialState,
    action: A
  ): Redux.ListStore<M> => {
    let newState = [...state];

    const actionReducer = findReducerForAction<P, Redux.ListStore<M>, A>(action, mappings, transformers);
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
    // If the reducer is provided with an extension reducer, apply the entire extension reducer to
    // the action and state.
    if (!isNil(options.extension)) {
      if (Array.isArray(options.extension)) {
        newState = reduce(
          options.extension,
          (st: Redux.ListStore<M>, ext: Reducer<Redux.ListStore<M>, A>) => ext(st, action),
          newState
        );
      } else {
        newState = options.extension(newState, action);
      }
    }
    return newState;
  };
  return reducer;
};
