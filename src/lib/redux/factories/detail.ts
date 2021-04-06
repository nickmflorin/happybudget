import { Reducer } from "redux";
import { initialDetailResponseState } from "store/initialState";
import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";
import { MappedReducers, FactoryOptions } from ".";

export type IDetailResponseActionMap = {
  Loading: string;
  Response: string;
  Request: string;
  RemoveFromState: string;
  UpdateInState: string;
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
  M extends Model,
  S extends Redux.IDetailResponseStore<M> = Redux.IDetailResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  /* eslint-disable indent */
  mappings: Partial<IDetailResponseActionMap>,
  options: Partial<FactoryOptions<S, A>> = {}
): Reducer<S, A> => {
  const Options = mergeOptionsWithDefaults<S, A>(options, initialDetailResponseState as S);

  const transformers: MappedReducers<IDetailResponseActionMap, S, A> = {
    Response: (st: S = Options.initialState, action: Redux.IAction<M>) => ({
      ...st,
      data: action.payload,
      responseWasReceived: true
    }),
    Loading: (st: S = Options.initialState, action: Redux.IAction<boolean>) => ({ ...st, loading: action.payload }),
    RemoveFromState: (st: S = Options.initialState) => ({ ...st, data: undefined }),
    UpdateInState: (st: S = Options.initialState, action: Redux.IAction<Partial<M>>) => ({
      ...st,
      data: { ...st.data, ...action.payload }
    }),
    Request: (st: S = Options.initialState) => ({ ...st, responseWasReceived: false })
  };

  return createObjectReducerFromMap<IDetailResponseActionMap, S, A>(mappings, transformers, Options);
};
