import { isNil, filter, isNil } from "lodash";
import { SagaIterator, Saga, SagaIterator } from "redux-saga";
import { spawn, take, cancel, call, spawn, debounce } from "redux-saga/effects";
import { Optional } from "utility-types";

import { redux } from "lib";

import * as actions from "./actions";
import * as tasks from "./tasks";

export const convertContextTaskToTask = <
  P extends Redux.ActionPayload = Redux.ActionPayload,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  contextTask: Redux.ContextTask<C>,
): Redux.Task<P, C> => {
  function* task(action: Redux.Action<P, C>): SagaIterator {
    yield call(contextTask, action.context);
  }
  return task;
};

export const createListSaga = <T, C extends Redux.ActionContext = Redux.ActionContext>(
  config: Redux.SagaConfig<
    Redux.ListTaskMap<C>,
    Pick<Redux.ListActionCreatorMap<T, C>, "request">,
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

export const createModelListSaga = <
  M extends Model.HttpModel,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Redux.SagaConfig<
    Redux.ModelListTaskMap<C>,
    Pick<Redux.ModelListActionCreatorMap<M, C>, "request">,
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

export const createAuthenticatedModelListSaga = <
  M extends Model.HttpModel,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Redux.SagaConfig<
    Redux.ModelListTaskMap,
    Optional<
      Pick<Redux.AuthenticatedModelListActionCreatorMap<M, C>, "setSearch" | "request">,
      "setSearch"
    >,
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
    if (!isNil(config.actions.setSearch)) {
      yield debounce(250, config.actions.setSearch.toString(), config.tasks.request);
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(watchForSearchSaga);
  }
  return rootSaga;
};

export const createPublicRootSaga = (config: Application.StoreConfig): Saga => {
  function* applicationSaga(): SagaIterator {
    const publicConfig = filter(
      config.modules,
      (c: Application.ModuleConfig) => c.isPublic === true,
    );
    for (let i = 0; i < publicConfig.length; i++) {
      const moduleConfig: Application.ModuleConfig = publicConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
  }
  return applicationSaga;
};

const createApplicationSaga = (config: Application.StoreConfig): Saga => {
  const publicSaga = createPublicRootSaga(config);

  const contactsSaga = redux.createAuthenticatedModelListSaga({
    tasks: { request: redux.convertContextTaskToTask(tasks.contacts.request) },
    actions: { request: actions.requestContactsAction },
  });
  const filteredContactsSaga = redux.createAuthenticatedModelListSaga({
    tasks: { request: redux.convertContextTaskToTask(tasks.contacts.requestFiltered) },
    actions: {
      request: actions.requestFilteredContactsAction,
      setSearch: actions.setContactsSearchAction,
    },
  });
  function* applicationSaga(): SagaIterator {
    const authenticatedConfig = filter(
      config.modules,
      (c: Application.ModuleConfig) => c.isPublic !== true,
    );
    for (let i = 0; i < authenticatedConfig.length; i++) {
      const moduleConfig: Application.ModuleConfig = authenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
    yield spawn(filteredContactsSaga);
    yield spawn(publicSaga);
  }
  return applicationSaga;
};

export default createApplicationSaga;
