import { redux } from "lib";

import { mergeOptionsWithDefaults, createObjectReducerFromMap } from "./util";

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
export const createListResponseReducer = <M, S extends Redux.ListResponseStore<M> = Redux.ListResponseStore<M>>(
  /* eslint-disable indent */
  mappings: Partial<Redux.ListResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.ListResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.ListResponseActionMap, S>(
    options,
    redux.initialState.initialListResponseState as S
  );
  return createObjectReducerFromMap<Redux.ListResponseActionMap, S>(
    mappings,
    transformers.listResponseReducerTransformers<M, S>(Options.initialState),
    Options
  );
};

export const createSimpleReadOnlyTableReducer = <
  M extends Model.Model,
  S extends Redux.ReadOnlyTableStore<M> = Redux.ReadOnlyTableStore<M>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.ReadOnlyTableActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.ReadOnlyTableActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.ReadOnlyTableActionMap, S>(
    options,
    redux.initialState.initialReadOnlyTableState as S
  );
  return createObjectReducerFromMap<Redux.ReadOnlyTableActionMap, S>(
    mappings,
    transformers.readOnlyTableReducerTransformers<M, S>(Options.initialState),
    Options
  );
};

export const createSimpleTableReducer = <M extends Model.Model, S extends Redux.TableStore<M> = Redux.TableStore<M>>(
  /* eslint-disable indent */
  mappings: Partial<Redux.TableActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.TableActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.TableActionMap, S>(options, redux.initialState.initialTableState as S);
  return createObjectReducerFromMap<Redux.ReadOnlyTableActionMap, S>(
    mappings,
    transformers.tableReducerTransformers<M, S>(Options.initialState),
    Options
  );
};

export const createReadOnlyModelListResponseReducer = <
  M extends Model.Model,
  S extends Redux.ReadOnlyModelListResponseStore<M> = Redux.ReadOnlyModelListResponseStore<M>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.ReadOnlyModelListResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.ReadOnlyModelListResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.ReadOnlyModelListResponseActionMap, S>(
    options,
    redux.initialState.initialReadOnlyModelListResponseState as S
  );
  return createObjectReducerFromMap<Redux.ReadOnlyModelListResponseActionMap, S>(
    mappings,
    transformers.readOnlyModelListResponseReducerTransformers(Options.initialState),
    Options
  );
};

export const createModelListResponseReducer = <
  M extends Model.Model,
  S extends Redux.ModelListResponseStore<M> = Redux.ModelListResponseStore<M>
>(
  /* eslint-disable indent */
  mappings: Partial<Redux.ModelListResponseActionMap>,
  options: Partial<Redux.FactoryOptions<Redux.ModelListResponseActionMap, S>> = {}
): Redux.Reducer<S> => {
  const Options = mergeOptionsWithDefaults<Redux.ModelListResponseActionMap, S>(
    options,
    redux.initialState.initialModelListResponseState as S
  );
  return createObjectReducerFromMap<Redux.ReadOnlyModelListResponseActionMap, S>(
    mappings,
    transformers.modelListResponseReducerTransformers(Options.initialState, Options.strictSelect),
    Options
  );
};
