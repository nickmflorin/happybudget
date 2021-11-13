import { SagaIterator, Saga } from "redux-saga";
import { spawn } from "redux-saga/effects";
import { isNil, filter } from "lodash";

import { redux, contacts } from "lib";

import * as actions from "./actions";

export const createUnauthenticatedRootSaga = (config: Application.AnyModuleConfig[]): Saga => {
  const contactsTasks = contacts.tasks.createTaskSet({
    authenticated: false
  });
  const contactsSaga = redux.sagas.createModelListResponseSaga({
    tasks: contactsTasks,
    actions: { request: actions.requestContactsAction }
  });
  function* applicationSaga(): SagaIterator {
    const unauthenticatedConfig = filter(config, (c: Application.AnyModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.UnauthenticatedModuleConfig[];
    for (let i = 0; i < unauthenticatedConfig.length; i++) {
      const moduleConfig: Application.UnauthenticatedModuleConfig = unauthenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
  }
  return applicationSaga;
};

export const createAuthenticatedRootSaga = (config: Application.AnyModuleConfig[]): Saga => {
  const contactsTasks = contacts.tasks.createTaskSet({ authenticated: true });
  const filteredContactsTasks = contacts.tasks.createFilteredTaskSet();
  const contactsSaga = redux.sagas.createAuthenticatedModelListResponseSaga({
    tasks: contactsTasks,
    actions: { request: actions.requestContactsAction }
  });
  const filteredContactsSaga = redux.sagas.createAuthenticatedModelListResponseSaga({
    tasks: filteredContactsTasks,
    actions: {
      request: actions.authenticated.requestFilteredContactsAction,
      setSearch: actions.authenticated.setContactsSearchAction
    }
  });
  function* applicationSaga(): SagaIterator {
    const authenticatedConfig = filter(
      config,
      (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.AuthenticatedModuleConfig[];
    for (let i = 0; i < authenticatedConfig.length; i++) {
      const moduleConfig: Application.AuthenticatedModuleConfig = authenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
    yield spawn(filteredContactsSaga);
  }
  return applicationSaga;
};
