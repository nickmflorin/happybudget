import { redux } from "lib";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";

/**
 * A reducer factory that creates a generic reducer to handle the read only state
 * of a detail response, where a detail response might be the response received from
 * submitting an API request to /entity/<pk>.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export const createReadOnlyDetailResponseReducer = <
  M extends Model.Model,
  S extends Redux.ReadOnlyModelDetailResponseStore<M> = Redux.ReadOnlyModelDetailResponseStore<M>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.ReadOnlyDetailResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.ReadOnlyDetailResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.ReadOnlyDetailResponseActionMap, S>(
    options,
    redux.initialState.initialReadOnlyDetailResponseState as S
  );

  const transformers: Redux.MappedReducers<Redux.ReadOnlyDetailResponseActionMap, S> = {
    Response: (st: S = Options.initialState, action: Redux.Action<M>) => ({
      ...st,
      data: action.payload,
      responseWasReceived: true
    }),
    Loading: (st: S = Options.initialState, action: Redux.Action<boolean>) => ({ ...st, loading: action.payload }),
    Request: (st: S = Options.initialState) => ({ ...st, responseWasReceived: false })
  };

  return createObjectReducerFromMap<Redux.ReadOnlyDetailResponseActionMap, S>(mappings, transformers, Options);
};

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
  S extends Redux.ModelDetailResponseStore<M> = Redux.ModelDetailResponseStore<M>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.DetailResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.DetailResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.DetailResponseActionMap, S>(
    options,
    redux.initialState.initialDetailResponseState as S
  );
  return createReadOnlyDetailResponseReducer(mappings, {
    ...Options,
    subReducers: {
      ...Options.subReducers,
      RemoveFromState: (st: S = Options.initialState) => ({ ...st, data: undefined }),
      UpdateInState: (st: S = Options.initialState, action: Redux.Action<Partial<M>>) => ({
        ...st,
        data: { ...st.data, ...action.payload }
      })
    }
  });
};
