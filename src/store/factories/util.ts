import { Reducer } from "redux";
import { forEach, isNil, reduce } from "lodash";

export const mergeOptionsWithDefaults = <S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  options: Partial<ReducerFactory.IOptions<S, A>>,
  initialState: S
): ReducerFactory.IOptions<S, A> => {
  return {
    referenceEntity: "entity",
    initialState: initialState,
    transformers: {},
    keyReducers: {},
    strictSelect: true,
    extension: null,
    excludeActions: null,
    ...options
  };
};

const findTransformerForAction = <
  P extends { [key: string]: any },
  S,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  action: A,
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, S, A>
): ReducerFactory.Transformer<S, any, A> | undefined => {
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
    const transformer: ReducerFactory.Transformer<S, any, A> | undefined = transformers[standardizedActionType];
    return transformer;
  }
  return undefined;
};

export const createSimpleReducerFromTransformers = <P, S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, S, A>,
  options: ReducerFactory.IOptions<S, A>
): Reducer<S, A> => {
  const reducer: Reducer<S, A> = (state: S = options.initialState, action: A): S => {
    const transformer = findTransformerForAction<P, S, A>(action, mappings, transformers);
    if (!isNil(transformer)) {
      return transformer(action.payload, state, action);
    }
    return state;
  };
  return reducer;
};

export const createObjectReducerFromTransformers = <P, S, A extends Redux.IAction<any> = Redux.IAction<any>>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, S, A>,
  options: ReducerFactory.IOptions<S, A>
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
      if (!isNil(options.transformers[action.type])) {
        if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
          const updateToState = options.transformers[action.type](action.payload, newState, action);
          newState = { ...newState, ...updateToState };
        }
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
    // If the reducer is provided with an extension reducer, apply the entire
    // extension reducer to the action and state.
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

export const createListReducerFromTransformers = <
  P,
  M extends Model,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<P>,
  transformers: ReducerFactory.Transformers<P, Redux.ListStore<M>, A>,
  options: ReducerFactory.IOptions<Redux.ListStore<M>, A>
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
      if (!isNil(options.transformers) && !isNil(options.transformers[action.type])) {
        if (isNil(options.excludeActions) || options.excludeActions(action, state) === false) {
          newState = options.transformers[action.type](action.payload, newState, action);
        }
      }
    }
    // If the reducer is provided with an extension reducer, apply the entire
    // extension reducer to the action and state.
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
