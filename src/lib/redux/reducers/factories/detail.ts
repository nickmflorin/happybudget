import { Reducer } from "redux";
import { redux } from "lib";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * detail response, where a detail response might be the response received from
 * submitting an API request to /entity/<pk>.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createDetailResponseReducer = <
  M extends Model.Model,
  S extends Redux.ModelDetailResponseStore<M> = Redux.ModelDetailResponseStore<M>,
  A extends Redux.Action<any> = Redux.Action<any>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.DetailResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.DetailResponseActionMap, S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<Redux.DetailResponseActionMap, S, A>(
    options,
    redux.initialState.initialDetailResponseState as S
  );

  const transformers: Redux.MappedReducers<Redux.DetailResponseActionMap, S, A> = {
    Response: (st: S = Options.initialState, action: Redux.Action<M>) => ({
      ...st,
      data: action.payload,
      responseWasReceived: true
    }),
    Loading: (st: S = Options.initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload }),
    RemoveFromState: (st: S = Options.initialState) => ({ ...st, data: undefined }),
    UpdateInState: (st: S = Options.initialState, action: Redux.Action<Partial<M>>) => ({
      ...st,
      data: { ...st.data, ...action.payload }
    }),
    Request: (st: S = Options.initialState) => ({ ...st, responseWasReceived: false })
  };

  return createObjectReducerFromMap<Redux.DetailResponseActionMap, S, A>(mappings, transformers, Options);
};
