import { SagaIterator, Saga } from "redux-saga";
import { spawn } from "redux-saga/effects";
import { isNil, filter } from "lodash";

import { redux, contacts } from "lib";

export const createPublicRootSaga = (config: Application.StoreConfig): Saga => {
  function* applicationSaga(): SagaIterator {
    const publicConfig = filter(config.modules, (c: Application.ModuleConfig) => c.isPublic === true);
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

  const contactsTasks = contacts.tasks.createTaskSet();
  const filteredContactsTasks = contacts.tasks.createFilteredTaskSet();
  const contactsSaga = redux.sagas.createAuthenticatedModelListResponseSaga({
    tasks: contactsTasks,
    actions: { request: contacts.actions.requestContactsAction }
  });
  const filteredContactsSaga = redux.sagas.createAuthenticatedModelListResponseSaga({
    tasks: filteredContactsTasks,
    actions: {
      request: contacts.actions.requestFilteredContactsAction,
      setSearch: contacts.actions.setContactsSearchAction
    }
  });
  function* applicationSaga(): SagaIterator {
    const authenticatedConfig = filter(config.modules, (c: Application.ModuleConfig) => c.isPublic !== true);
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
