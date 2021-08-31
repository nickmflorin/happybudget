import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { forEach, isNil } from "lodash";
import { util } from "lib";

const findReducerForAction = <S, A extends { [key: string]: any }>(
  /* eslint-disable indent */
  action: Redux.Action,
  map: Partial<Redux.ActionMapObject<A>>,
  transformers: Redux.Transformers<S, A>
): Redux.Reducer<S> | undefined => {
  let key: string;
  for (key in map) {
    const mapped: ActionCreatorWithPayload<any> | undefined = map[key];
    if (!isNil(mapped) && action.type === mapped.toString()) {
      return transformers[key];
    }
  }
  return undefined;
};

const reduceAction = <S, A>(
  state: S,
  action: Redux.Action,
  config: Redux.ReducerConfig<S, A>,
  transformers: Redux.Transformers<S, A>
): S => {
  const reducer: Redux.Reducer<S> | undefined = findReducerForAction(action, config.actions, transformers);
  if (!isNil(reducer)) {
    return reducer(state, action);
  }
  return state;
};

export const createObjectReducerFromTransformers = <S extends Record<string, any>, A>(
  config: Redux.ReducerConfig<S, A>,
  reducers: Redux.Transformers<S>,
  /* eslint-disable no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  const reducer: Redux.Reducer<S> = (state: S = config.initialState, action: Redux.Action): S => {
    let newState = { ...state };

    newState = reduceAction(state, action, config, reducers);

    if (!isNil(subReducers)) {
      forEach(subReducers, (subReducer: Redux.Reducer<any>, stateDirective: string) => {
        const subState = util.getKeyValue<S, keyof S>(stateDirective as keyof S)(newState);
        if (!isNil(subState)) {
          newState = { ...newState, [stateDirective]: subReducer(subState, action) };
        }
      });
    }
    return newState;
  };
  return reducer;
};
