import { Reducer } from "redux";
import { mergeWithDefaults } from "util/objects";
import { initialDetailResponseState } from "store/initialState";
import { createObjectReducerFromTransformers } from "./util";

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
  mappings: Partial<ReducerFactory.IDetailResponseActionMap>,
  options: Partial<ReducerFactory.ITransformerReducerOptions<S, A>> = {
    initialState: initialDetailResponseState as S,
    referenceEntity: "entity"
  }
): Reducer<S, A> => {
  const Options = mergeWithDefaults<ReducerFactory.ITransformerReducerOptions<S, A>>(options, {
    extensions: {},
    initialState: initialDetailResponseState as S,
    excludeActionsFromExtensions: true,
    referenceEntity: "entity"
  });

  const transformers: ReducerFactory.Transformers<ReducerFactory.IDetailResponseActionMap, S, A> = {
    Response: (payload: M) => ({ data: payload, responseWasReceived: true }),
    Loading: (payload: boolean) => ({ loading: payload }),
    RemoveFromState: (payload?: null | undefined) => ({ data: undefined }),
    UpdateInState: (payload: M) => ({ data: payload }),
    Request: (payload: null) => ({ responseWasReceived: false })
  };

  return createObjectReducerFromTransformers<ReducerFactory.IDetailResponseActionMap, S, A>(
    mappings,
    transformers,
    Options
  );
};