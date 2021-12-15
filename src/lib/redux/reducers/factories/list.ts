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
  S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>,
  A extends Partial<Redux.ListResponseActionMap<M, any>> = Redux.ListResponseActionMap<M, any>
>(
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, A>(
    config,
    transformers.listResponseReducerTransformers<M, S>(config.initialState),
    subReducers
  );
};

export const createModelListResponseReducer = <
  M extends Model.HttpModel,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>,
  A extends Partial<Redux.ModelListResponseActionMap<M, any>> = Redux.ModelListResponseActionMap<M, any>
>(
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, A>(
    config,
    transformers.modelListResponseReducerTransformers(config.initialState),
    subReducers
  );
};

export const createAuthenticatedModelListResponseReducer = <
  M extends Model.HttpModel,
  S extends Redux.AuthenticatedModelListResponseStore<M> = Redux.AuthenticatedModelListResponseStore<M>,
  A extends Partial<
    Redux.AuthenticatedModelListResponseActionMap<M, any>
  > = Redux.AuthenticatedModelListResponseActionMap<M, any>
>(
  config: Redux.ReducerConfig<S, A>,
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  subReducers?: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {}
): Redux.Reducer<S> => {
  return createObjectReducerFromTransformers<S, A>(
    config,
    transformers.authenticatedModelListResponseReducerTransformers(config.initialState),
    subReducers
  );
};
