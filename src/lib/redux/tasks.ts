import { SagaIterator } from "redux-saga";
import { call, select, all, CallEffect } from "redux-saga/effects";
import { isNil, map, filter, isEqual } from "lodash";

import * as api from "api";
import { redux, notifications } from "lib";

type MinimumRequestEffectStore = {
  readonly invalidated: boolean;
  readonly error: api.RequestError | null;
};

export const canUseCachedResponse = <S extends MinimumRequestEffectStore>(s: S) =>
  s.error === null && s.invalidated === false;

/* The detail based store that the request is updating must conform to the
   following form: */
type MininumDetailRequestEffectStore<M extends Model.HttpModel> = MinimumRequestEffectStore & {
  readonly data: M | null;
};

export const canUseCachedDetailResponse = <M extends Model.HttpModel, S extends MininumDetailRequestEffectStore<M>>(
  s: S
) => s.data !== null && canUseCachedResponse(s);

type MimimumListRequestEffectStore = MinimumRequestEffectStore & {
  readonly responseWasReceived: boolean;
  readonly query?: Http.ListQuery;
};

export const canUseCachedListResponse = <S extends MimimumListRequestEffectStore>(s: S, query?: Http.ListQuery) => {
  /*
	If the response was already received and there was not an error, it is
	safe to use the last request (pending a determination if the list query
	for the new request is different).
	*/
  const conditional = s.responseWasReceived && canUseCachedResponse(s);
  if (s.query !== undefined && query !== undefined) {
    return conditional && isEqual(query, s.query);
  }
  return conditional;
};

export const canUseCachedIndexedResponse = <S, DS extends MinimumRequestEffectStore>(
  s: Redux.ModelIndexedStore<S>,
  getStore: (s: S) => DS,
  id: number
) => {
  /*
	This can happen due to timing in between Redux Reducers & Sagas.  When a
	request to obtain the data for a given indexed ID is made, and that ID is
	not already indexed in the store, the reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedResponse(getStore(s[id]));
};

export const canUseCachedIndexedListResponse = <S, TS extends MimimumListRequestEffectStore>(
  s: Redux.ModelIndexedStore<S>,
  getStore: (s: S) => TS,
  id: number,
  query?: Http.ListQuery
) => {
  /*
	This can happen due to timing in between Redux Reducers & Sagas.  When a
	request to obtain the data for a given indexed ID is made, and that ID is
	not already indexed in the store, the reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedListResponse(getStore(s[id]), query);
};

export const canUseCachedIndexedDetailResponse = <
  M extends Model.HttpModel,
  S,
  DS extends MininumDetailRequestEffectStore<M>
>(
  s: Redux.ModelIndexedStore<S>,
  getStore: (s: S) => DS,
  id: number
) => {
  /*
	This can happen due to timing in between Redux Reducers & Sagas.  When a
	request to obtain the data for a given indexed ID is made, and that ID is
	not already indexed in the store, the reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedDetailResponse(getStore(s[id]));
};

type WrapListRequestEffectConfigErrorREConfig<S extends MimimumListRequestEffectStore> = {
  readonly query?: Http.ListQuery;
  readonly selectStore?: (s: Application.Store) => S;
};

type WrapListRequestEffectsHandleConfig = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly table: Table.TableInstance<any, any>;
  readonly errorDetail?: string;
  readonly errorMessage: string;
};

type WrapListRequestEffectHandleConfig<S extends MimimumListRequestEffectStore> = WrapListRequestEffectsHandleConfig & {
  readonly query?: Http.ListQuery;
  readonly selectStore?: (s: Application.Store) => S;
};

type WrapListRequestEffectConfig<S extends MimimumListRequestEffectStore> =
  | WrapListRequestEffectConfigErrorREConfig<S>
  | WrapListRequestEffectHandleConfig<S>;

const isHandleErrorConfig = <S extends MimimumListRequestEffectStore>(
  c: WrapListRequestEffectConfig<S>
): c is WrapListRequestEffectHandleConfig<S> => (c as WrapListRequestEffectHandleConfig<S>).table !== undefined;

type WrapListRequestEffectRT<
  C,
  S extends MimimumListRequestEffectStore,
  CFG extends WrapListRequestEffectConfig<S> = WrapListRequestEffectConfig<S>
> = CFG extends WrapListRequestEffectHandleConfig<S>
  ? Redux.ListRequestEffectRT<C>
  : Redux.ListRequestEffectRTWithError<C>;

export const wrapListRequestEffect = <
  C,
  S extends MimimumListRequestEffectStore,
  CFG extends WrapListRequestEffectConfig<S> = WrapListRequestEffectConfig<S>
>(
  effect: CallEffect<Http.ListResponse<C>>,
  action: Redux.Action<Redux.TableRequestPayload>,
  config: CFG
): CallEffect<WrapListRequestEffectRT<C, S, CFG>> => {
  type RT = SagaIterator<WrapListRequestEffectRT<C, S, CFG>>;
  return call<() => RT>(function* (): SagaIterator {
    const requestCached = yield select((s: Application.Store) =>
      !isNil(config.selectStore) ? canUseCachedListResponse(config.selectStore(s), config.query) : false
    );
    if (!requestCached || redux.requestActionIsForced(action)) {
      try {
        const result = yield effect;
        return result as RT;
      } catch (e: unknown) {
        if (isHandleErrorConfig(config)) {
          config.table.handleRequestError(e as Error, {
            message: config.errorMessage,
            detail: config.errorDetail,
            dispatchClientErrorToSentry: true
          });
          /* If the error is not an api.RequestError, it will be thrown in the
             handleRequestError method. */
          const result = yield call(() => ({ data: [], count: 0, error: e as api.RequestError }));
          return result as RT;
        }
        const result = yield call(() => ({ error: e as Error }));
        return result as RT;
      }
    } else {
      const result = yield call(() => null);
      return result as RT;
    }
  });
};

type MultipleRequestEffectRTs<CS extends unknown[]> = {
  [Property in keyof CS]: Redux.ListRequestEffectRTWithError<CS[Property]>;
};

type MultipleRequestEffects<CS extends unknown[]> = {
  [Property in keyof CS]: CallEffect<Redux.ListRequestEffectRTWithError<CS[Property]>>;
};

type ResponseOrNull<CS extends unknown[]> = {
  [Property in keyof CS]: Http.RenderedListResponse<CS[Property]> | null;
};

export const wrapListRequestEffects = <CS extends unknown[]>(
  effects: MultipleRequestEffects<CS>,
  config: WrapListRequestEffectsHandleConfig
) =>
  call<() => SagaIterator<ResponseOrNull<CS>>>(function* (): SagaIterator {
    const results: MultipleRequestEffectRTs<CS> = yield all(effects);
    const errors = map(
      filter(
        results as Redux.ListRequestEffectRTWithError<CS[number]>[],
        (r: Redux.ListRequestEffectRTWithError<CS[number]>) => redux.tableRequestEffectRTIsError<CS[number]>(r)
      ) as Redux.RequestEffectError[],
      (er: Redux.RequestEffectError) => er.error
    );
    if (errors.length === 1) {
      config.table.handleRequestError(errors[0], {
        message: config.errorMessage,
        detail: config.errorDetail,
        dispatchClientErrorToSentry: true
      });
    } else if (errors.length !== 0) {
      /*
			Dispatch errors to Sentry or the console.  If any error is not an
			instance of api.RequestError, it will be thrown. */
      notifications.internal.handleRequestError(errors);
      /*
			Only issue a single table notification in the case that one or both
			of the relevant requests failed. */
      config.table.notify({
        message: config.errorMessage,
        detail: config.errorDetail
      });
    }
    const rs = yield call(() =>
      map(results, (r: Redux.ListRequestEffectRTWithError<CS[number]>) =>
        redux.tableRequestEffectRTIsError(r) ? { error: r.error } : r
      )
    );
    return rs as ResponseOrNull<CS>;
  });
