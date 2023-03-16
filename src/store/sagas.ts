import { isNil, filter } from "lodash";
import { SagaIterator, Saga } from "redux-saga";
import { spawn } from "redux-saga/effects";

import { redux } from "lib";

import * as actions from "./actions";
import * as tasks from "./tasks";

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
