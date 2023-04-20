import { type Saga, type SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import * as config from "../../../application/config";
import * as actions from "../../../application/store/actions";
import * as tasks from "../tasks";

import * as factories from "./factories";

export const createPublicRootSaga = (): Saga => {
  function* applicationSaga(): SagaIterator {
    for (let i = 0; i < config.PUBLIC_MODULE_LABELS.length; i++) {
      const moduleConfig = config.PUBLIC_MODULE_CONFIGS[config.PUBLIC_MODULE_LABELS[i]];
      if (moduleConfig.rootSaga !== undefined) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
  }
  return applicationSaga;
};

export const createApplicationSaga = (): Saga => {
  const publicSaga = createPublicRootSaga();

  const contactsSaga = factories.createAuthenticatedApiModelListSaga({
    tasks: { request: factories.convertContextTaskToTask(tasks.requestContacts) },
    actions: { request: actions.requestContactsAction },
  });

  const filteredContactsSaga = factories.createAuthenticatedApiModelListSaga({
    tasks: { request: factories.convertContextTaskToTask(tasks.requestContacts) },
    actions: {
      request: actions.requestFilteredContactsAction,
      setSearch: actions.setContactsSearchAction,
    },
  });

  function* applicationSaga(): SagaIterator {
    for (let i = 0; i < config.AUTH_MODULE_LABELS.length; i++) {
      const moduleConfig = config.AUTH_MODULE_CONFIGS[config.AUTH_MODULE_LABELS[i]];
      if (moduleConfig.rootSaga !== undefined) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsSaga);
    yield spawn(filteredContactsSaga);
    yield spawn(publicSaga);
  }
  return applicationSaga;
};
