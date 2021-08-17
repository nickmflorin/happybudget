import { SagaIterator, Saga } from "redux-saga";
import { spawn } from "redux-saga/effects";
import { isNil, filter } from "lodash";

import { redux } from "lib";
import { AuthenticatedActionTypes, UnauthenticatedActionTypes } from "../actions";
import { createContactsTaskSet, createReadOnlyContactsTaskSet } from "./contacts";

const contactsRootSaga = redux.sagas.factories.createTableSaga(
  {
    Request: AuthenticatedActionTypes.User.Contacts.Request,
    TableChanged: AuthenticatedActionTypes.User.Contacts.TableChanged
  },
  createContactsTaskSet()
);

const contactsReadOnlyRootSaga = redux.sagas.factories.createReadOnlyTableSaga(
  { Request: UnauthenticatedActionTypes.Contacts.Request },
  createReadOnlyContactsTaskSet()
);

export const createUnauthenticatedRootSaga = (config: Modules.ModuleConfigs): Saga => {
  function* applicationSaga(): SagaIterator {
    let unauthenticatedConfig: Modules.Unauthenticated.ModuleConfigs = filter(config, (c: Modules.ModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Modules.Unauthenticated.ModuleConfigs;
    for (var i = 0; i < unauthenticatedConfig.length; i++) {
      const moduleConfig: Modules.Unauthenticated.ModuleConfig = unauthenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsReadOnlyRootSaga);
  }
  return applicationSaga;
};

export const createAuthenticatedRootSaga = (config: Modules.ModuleConfigs): Saga => {
  function* applicationSaga(): SagaIterator {
    let authenticatedConfig: Modules.Authenticated.ModuleConfigs = filter(
      config,
      (c: Modules.ModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Modules.Authenticated.ModuleConfigs;
    for (var i = 0; i < authenticatedConfig.length; i++) {
      const moduleConfig: Modules.Authenticated.ModuleConfig = authenticatedConfig[i];
      if (!isNil(moduleConfig.rootSaga)) {
        yield spawn(moduleConfig.rootSaga);
      }
    }
    yield spawn(contactsRootSaga);
  }
  return applicationSaga;
};
