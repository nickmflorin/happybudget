import { isEqual } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, select, all, CallEffect } from "redux-saga/effects";

import { notifications, model, tabling } from "lib";

import * as api from "../../application/api";
import * as errors from "../../application/errors";
import * as types from "../../application/store/types";

type MinimumRequestEffectStore = {
  readonly invalidated: boolean;
  readonly error: errors.HttpError | null;
};

export const canUseCachedResponse = <S extends MinimumRequestEffectStore>(s: S) =>
  s.error === null && s.invalidated === false;

// The detail based store that the request is updating must conform to the following form:
type MininumDetailRequestEffectStore<M extends model.ApiModel> = MinimumRequestEffectStore & {
  readonly data: M | null;
};

export const canUseCachedDetailResponse = <
  M extends model.ApiModel,
  S extends MininumDetailRequestEffectStore<M>,
>(
  s: S,
) => s.data !== null && canUseCachedResponse(s);

type MimimumListRequestEffectStore = MinimumRequestEffectStore & {
  readonly responseWasReceived: boolean;
  readonly query?: api.ListQuery;
};

export const canUseCachedListResponse = <S extends MimimumListRequestEffectStore>(
  s: S,
  query?: api.ListQuery,
) => {
  /* If the response was already received and there was not an error, it is safe to use the last
     request (pending a determination if the list query for the new request is different). */
  const conditional = s.responseWasReceived && canUseCachedResponse(s);
  if (s.query !== undefined && query !== undefined) {
    return conditional && isEqual(query, s.query);
  }
  return conditional;
};

export const canUseCachedIndexedResponse = <S, DS extends MinimumRequestEffectStore>(
  s: types.ModelIndexedStore<S>,
  getStore: (s: S) => DS,
  id: number,
) => {
  /* This can happen due to timing in between Redux Reducers & Sagas.  When a request to obtain the
     data for a given indexed ID is made, and that ID is not already indexed in the store, the
     reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedResponse(getStore(s[id]));
};

export const canUseCachedIndexedListResponse = <S, TS extends MimimumListRequestEffectStore>(
  s: types.ModelIndexedStore<S>,
  getStore: (s: S) => TS,
  id: number,
  query?: api.ListQuery,
) => {
  /* This can happen due to timing in between Redux Reducers & Sagas.  When a	request to obtain the
     data for a given indexed ID is made, and that ID is not already indexed in the store, the
     reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedListResponse(getStore(s[id]), query);
};

export const canUseCachedIndexedDetailResponse = <
  M extends model.ApiModel,
  S,
  DS extends MininumDetailRequestEffectStore<M>,
>(
  s: types.ModelIndexedStore<S>,
  getStore: (s: S) => DS,
  id: number,
) => {
  /* This can happen due to timing in between Redux Reducers & Sagas.  When a request to obtain the
     data for a given indexed ID is made, and that ID is not already indexed in the store, the
     reducer will use the initial state. */
  if (s[id] === undefined) {
    return false;
  }
  return canUseCachedDetailResponse(getStore(s[id]));
};

type WrapListRequestEffectConfigErrorREConfig<S extends MimimumListRequestEffectStore> = {
  readonly query?: api.ListQuery;
  readonly selectStore?: (s: types.ApplicationStore) => S;
};

type WrapListRequestEffectsHandleConfig = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly table: tabling.TableInstance<any, any>;
  readonly errorDetail?: string;
  readonly errorMessage: string;
};

type WrapListRequestEffectHandleConfig<S extends MimimumListRequestEffectStore> =
  WrapListRequestEffectsHandleConfig & {
    readonly query?: api.ListQuery;
    readonly selectStore?: (s: types.ApplicationStore) => S;
  };

type WrapListRequestEffectConfig<S extends MimimumListRequestEffectStore> =
  | WrapListRequestEffectConfigErrorREConfig<S>
  | WrapListRequestEffectHandleConfig<S>;

const isHandleErrorConfig = <S extends MimimumListRequestEffectStore>(
  c: WrapListRequestEffectConfig<S>,
): c is WrapListRequestEffectHandleConfig<S> =>
  (c as WrapListRequestEffectHandleConfig<S>).table !== undefined;

export const wrapListRequestEffect = <
  C extends api.ListResponseIteree,
  S extends MimimumListRequestEffectStore = MimimumListRequestEffectStore,
  CFG extends WrapListRequestEffectConfig<S> = WrapListRequestEffectConfig<S>,
>(
  effect: CallEffect<api.ClientResponse<api.ApiListResponse<C>>>,
  action: types.Action<types.TableRequestActionPayload>,
  config: CFG,
): CallEffect<api.ClientResponse<api.ApiListResponse<C>> | null> =>
  call<() => SagaIterator<api.ClientResponse<api.ApiListResponse<C>> | null>>(
    function* (): SagaIterator {
      const requestCached = yield select((s: types.ApplicationStore) =>
        config.selectStore !== undefined
          ? canUseCachedListResponse(config.selectStore(s), config.query)
          : false,
      );
      if (!requestCached || types.tableRequestActionIsForced(action)) {
        const result: api.ClientResponse<api.ApiListResponse<C>> = yield effect;
        if (result.error && isHandleErrorConfig(config)) {
          config.table.handleRequestError(result.error, {
            message: config.errorMessage,
            detail: config.errorDetail,
            dispatchClientErrorToSentry: true,
          });
        }
        const yielded = yield call(() => result);
        return yielded;
      }
      const result = yield call(() => null);
      return result;
    },
  );

type MultipleRequestEffectRTs<CS extends api.ListResponseIteree[]> = {
  [Property in keyof CS]: api.ClientResponse<api.ApiListResponse<CS[Property]>> | null;
};

type MultipleRequestEffects<CS extends api.ListResponseIteree[]> = {
  [Property in keyof CS]: CallEffect<api.ClientResponse<api.ApiListResponse<CS[Property]>> | null>;
};

export const wrapListRequestEffects = <CS extends api.ListResponseIteree[]>(
  effects: MultipleRequestEffects<CS>,
  config: WrapListRequestEffectsHandleConfig,
) =>
  call<() => SagaIterator<MultipleRequestEffectRTs<CS>>>(function* (): SagaIterator {
    const results: MultipleRequestEffectRTs<CS> = yield all(effects);

    const errors = (
      results.filter((r: typeof results[number]) => r !== null && r.error !== undefined) as {
        [Property in keyof CS]: api.ClientResponse<api.ApiListResponse<CS[Property]>>;
      }
    ).map((r: api.ClientResponse<api.ApiListResponse<CS[number]>>) => r.error as errors.HttpError);

    if (errors.length === 1) {
      config.table.handleRequestError(errors[0], {
        message: config.errorMessage,
        detail: config.errorDetail,
        dispatchClientErrorToSentry: true,
      });
    } else if (errors.length !== 0) {
      /* Dispatch errors to Sentry or the console.  If any error is not an instance of
         errors.HttpError, it will be thrown. */
      notifications.internal.handleRequestError(errors);
      /* Only issue a single table notification in the case that one or both of the relevant
         requests failed. */
      config.table.notify({
        message: config.errorMessage,
        detail: config.errorDetail,
      });
    }

    const rs = yield call(() => results);
    return rs;
  });
