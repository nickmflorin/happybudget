import { Reducer } from "redux";
import { forEach, isNil } from "lodash";

const findTransformerForAction = <
  P extends ReducerFactory.IActionMap,
  S,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  action: A,
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, S, A>
): ReducerFactory.Transformer<S, A> | undefined => {
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
    const transformer: ReducerFactory.Transformer<S, A> | undefined = transformers[standardizedActionType];
    return transformer;
  }
  return undefined;
};

export const createObjectReducerFromTransformers = <
  P extends ReducerFactory.IActionMap,
  S,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, S, A>,
  options: ReducerFactory.ITransformerReducerOptions<S, A>
): Reducer<S, A> => {
  const reducer: Reducer<S, A> = (state: S = options.initialState, action: A): S => {
    let newState = { ...state };

    const transformer = findTransformerForAction<P, S, A>(action, mappings, transformers);
    if (!isNil(transformer)) {
      // If the action is being filtered out of the reducer, do not update the state.
      if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
        const updateToState = transformer(action.payload, newState, action);
        newState = { ...newState, ...updateToState };
      }
    } else {
      if (!isNil(options.extensions) && !isNil(options.extensions[action.type])) {
        if (
          isNil(options.excludeActions) ||
          options.excludeActionsFromExtensions !== true ||
          options.excludeActions(action, state) === false
        ) {
          const updateToState = options.extensions[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
      }
      // If key reducers are supplied, indexed by the key in the state they are
      // updating, apply each key reducer to update the state corresponding to
      // the associated key.  Note that key reducers can only be used when we
      // are merging states.
      if (!isNil(options.keyReducers)) {
        const subReducers: { [key: string]: Reducer<any, A> } = options.keyReducers;
        forEach(Object.keys(options.keyReducers), (key: string) => {
          if (!isNil(newState[key as keyof S])) {
            const red: Reducer<any, A> = subReducers[key];
            newState = { ...newState, [key]: red(newState[key as keyof S], action) };
          }
        });
      }
    }
    // If the reducer is provided with an extension reducer, apply the entire
    // extension reducer to the action and state.
    if (!isNil(options.extension)) {
      newState = options.extension(newState, action);
    }
    return newState;
  };
  return reducer;
};

export const createListReducerFromTransformers = <
  P extends ReducerFactory.IActionMap,
  M extends Model,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, Redux.ListStore<M>, A>,
  options: ReducerFactory.ITransformerReducerOptions<Redux.ListStore<M>, A>
): Reducer<Redux.ListStore<M>, A> => {
  const reducer: Reducer<Redux.ListStore<M>, A> = (
    state: Redux.ListStore<M> = options.initialState,
    action: A
  ): Redux.ListStore<M> => {
    let newState = [...state];

    const transformer = findTransformerForAction<P, Redux.ListStore<M>, A>(action, mappings, transformers);
    if (!isNil(transformer)) {
      // If the action is being filtered out of the reducer, do not update the state.
      if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
        const update = transformer(action.payload, newState, action);
        if (!isNil(update)) {
          newState = update;
        }
      }
    } else {
      if (!isNil(options.extensions) && !isNil(options.extensions[action.type])) {
        if (
          isNil(options.excludeActions) ||
          options.excludeActionsFromExtensions !== true ||
          options.excludeActions(action, state) === false
        ) {
          newState = options.extensions[action.type](action.payload, newState, action);
        }
      }
    }
    // If the reducer is provided with an extension reducer, apply the entire
    // extension reducer to the action and state.
    if (!isNil(options.extension)) {
      newState = options.extension(newState, action);
    }
    return newState;
  };
  return reducer;
};
