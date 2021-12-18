import { isNil } from "lodash";

const findReducerForAction = <S, A extends Redux.ActionMap>(
  action: Redux.InferAction<A[keyof A]>,
  map: Partial<A>,
  transformers: Redux.Transformers<S, A>
): Redux.Reducer<S, Redux.InferAction<A[keyof A]>> | undefined => {
  for (let i = 0; i < Object.keys(map).length; i++) {
    const key = Object.keys(map)[i] as keyof A;
    const t = transformers[key];
    const a = map[key];
    if (!isNil(a) && action.type === a.toString()) {
      return t;
    }
  }
  return undefined;
};

const reduceAction = <S, A extends Redux.ActionMap>(
  state: S,
  action: Redux.InferAction<A[keyof A]>,
  config: Redux.ReducerConfig<S, A>,
  transformers: Redux.Transformers<S, A>
): S => {
  const reducer: Redux.Reducer<S, Redux.InferAction<A[keyof A]>> | undefined = findReducerForAction(
    action,
    config.actions,
    transformers
  );
  if (!isNil(reducer)) {
    return reducer(state, action);
  }
  return state;
};

export const createObjectReducerFromTransformers = <S, A extends Redux.ActionMap>(
  config: Redux.ReducerConfig<S, A>,
  reducers: Redux.Transformers<S, A>
): Redux.Reducer<S, Redux.InferAction<A[keyof A]>> => {
  const reducer: Redux.Reducer<S, Redux.InferAction<A[keyof A]>> = (
    state: S = config.initialState,
    action: Redux.InferAction<A[keyof A]>
  ): S => reduceAction(state, action, config, reducers);
  return reducer;
};
