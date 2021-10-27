import { SagaIterator, Saga } from "redux-saga";
import { spawn } from "redux-saga/effects";
import { isNil, filter } from "lodash";

import { redux } from "lib";

import * as actions from "./actions";
import * as tasks from "./tasks";

export const createUnauthenticatedRootSaga = (config: Application.AnyModuleConfig[]): Saga => {
  const contactsTasks = tasks.contacts.createTaskSet({
    authenticated: false
  });
  const contactsSaga = redux.sagas.createModelListResponseSaga({
    tasks: contactsTasks,
    actions: { request: actions.requestContactsAction }
  });
  function* applicationSaga(): SagaIterator {
    const unauthenticatedConfig = filter(config, (c: Application.AnyModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.Unauthenticated.ModuleConfig[];
    for (var i = 0; i < unauthenticatedConfig.length; i++) {
      const moduleConfig: Application.Unauthenticated.ModuleConfig = unauthenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
  }
  return applicationSaga;
};

export const createAuthenticatedRootSaga = (config: Application.AnyModuleConfig[]): Saga => {
  const contactsTasks = tasks.contacts.createTaskSet({
    authenticated: true
  });
  const contactsSaga = redux.sagas.createAuthenticatedModelListResponseSaga({
    tasks: contactsTasks,
    actions: { request: actions.requestContactsAction, setSearch: actions.authenticated.setContactsSearchAction }
  });
  function* applicationSaga(): SagaIterator {
    const authenticatedConfig = filter(
      config,
      (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.Authenticated.ModuleConfig[];
    for (var i = 0; i < authenticatedConfig.length; i++) {
      const moduleConfig: Application.Authenticated.ModuleConfig = authenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
  }
  return applicationSaga;
};
