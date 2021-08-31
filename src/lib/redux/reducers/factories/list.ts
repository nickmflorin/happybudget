import { createObjectReducerFromTransformers } from "./util";

import * as transformers from "./transformers";

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/.
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
/* eslint-disable indent */
export const createListResponseReducer = <
  M,
  A extends Partial<Redux.ListResponseActionMap<M>> = Redux.ListResponseActionMap<M>,
  S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>
>(
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, A>(
    config,
    transformers.listResponseReducerTransformers<M, S>(config.initialState),
    subReducers
  );
};

export const createModelListResponseReducer = <
  M extends Model.Model,
  A extends Partial<Redux.ModelListResponseActionMap<M>> = Redux.ModelListResponseActionMap<M>,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>
>(
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, A>(
    config,
    transformers.modelListResponseReducerTransformers(config.initialState),
    subReducers
  );
};
