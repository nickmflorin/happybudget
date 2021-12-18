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

export const createListResponseReducer = <
  M,
  P extends Redux.ActionPayload = null,
  S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>
>(
  config: Redux.ReducerConfig<S, Redux.ListResponseActionMap<M, P>>
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, Redux.ListResponseActionMap<M, P>>(
    config,
    transformers.listResponseReducerTransformers<M, S>(config.initialState)
  );
};

export const createModelListResponseReducer = <
  M extends Model.HttpModel,
  P extends Redux.ActionPayload = null,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>
>(
  config: Redux.ReducerConfig<S, Redux.ModelListResponseActionMap<M, P>>
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, Redux.ModelListResponseActionMap<M, P>>(
    config,
    transformers.modelListResponseReducerTransformers(config.initialState)
  );
};

export const createAuthenticatedModelListResponseReducer = <
  M extends Model.HttpModel,
  P extends Redux.ActionPayload = null,
  C extends Table.Context = Table.Context,
  S extends Redux.AuthenticatedModelListResponseStore<M> = Redux.AuthenticatedModelListResponseStore<M>
>(
  config: Redux.ReducerConfig<S, Partial<Redux.AuthenticatedModelListResponseActionMap<M, P, C>>>
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, Redux.AuthenticatedModelListResponseActionMap<M, P, C>>(
    config,
    transformers.authenticatedModelListResponseReducerTransformers(config.initialState)
  );
};
