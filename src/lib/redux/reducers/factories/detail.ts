import { createObjectReducerFromTransformers } from "./util";

/**
 * A reducer factory that creates a generic reducer to handle the read only state
 * of a detail response, where a detail response might be the response received
 * from submitting an API request to /entity/<pk>.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createDetailResponseReducer = <
  M extends Model.HttpModel,
  A extends Partial<Redux.ModelDetailResponseActionMap<M>> = Redux.ModelDetailResponseActionMap<M>,
  S extends Redux.ModelDetailResponseStore<M> = Redux.ModelDetailResponseStore<M>
>(
  /* eslint-disable indent */
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  const transformers: Redux.Transformers<S, Redux.ModelDetailResponseActionMap<M>> = {
    response: (st: S = config.initialState, action: Redux.Action<M>) => ({
      ...st,
      data: action.payload
    }),
    loading: (st: S = config.initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload }),
    updateInState: (st: S = config.initialState, action: Redux.Action<Redux.UpdateActionPayload<M>>) => ({
      ...st,
      data: { ...st.data, ...action.payload.data }
    })
  };
  return createObjectReducerFromTransformers<S, A>(config, transformers, subReducers);
};
