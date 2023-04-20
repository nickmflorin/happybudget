import { type SagaIterator } from "redux-saga";
import { spawn, take, cancel, call, debounce } from "redux-saga/effects";

import { model } from "lib";

import * as api from "../../../application/api";
import * as types from "../../../application/store/types";

export const convertContextTaskToTask = <A extends types.Action>(
  contextTask: types.ContextTask<A>,
): types.Task<A> => {
  function* task(action: A): SagaIterator {
    yield call(contextTask, action.context as types.ActionContext<A>);
  }
  return task;
};

export const createListSaga = <
  T extends api.ListResponseIteree,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.SagaConfig<types.ListTaskMap<C>, Pick<types.ListActionPayloadMap<T>, "request">, C>,
) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.request.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.request, action);
    }
  }
  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createApiModelListSaga = <
  M extends model.ApiModel,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.SagaConfig<
    types.ModelListTaskMap<C>,
    Pick<types.ApiModelListActionPayloadMap<M>, "request">,
    C
  >,
) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.request.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.request, action);
    }
  }
  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createAuthenticatedApiModelListSaga = <
  M extends model.ApiModel,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.SagaConfig<
    types.ModelListTaskMap,
    {
      request: types.AuthenticatedApiModelListActionPayloadMap<M>["request"];
      setSearch?: types.AuthenticatedApiModelListActionPayloadMap<M>["setSearch"];
    },
    C
  >,
) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(config.actions.request.toString());
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(config.tasks.request, action);
    }
  }

  function* watchForSearchSaga(): SagaIterator {
    if (config.actions.setSearch !== undefined) {
      yield debounce(250, config.actions.setSearch.toString(), config.tasks.request);
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(watchForSearchSaga);
  }
  return rootSaga;
};
