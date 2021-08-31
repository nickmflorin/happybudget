import { Middleware, createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware, { Saga } from "redux-saga";
import * as Sentry from "@sentry/react";

import { redux } from "lib";

import GlobalReduxConfig from "./config";
import { createAuthenticatedReducer, createUnauthenticatedReducer } from "./reducer";
import { createAuthenticatedRootSaga, createUnauthenticatedRootSaga } from "./sagas";
import { createAuthenticatedInitialState, createUnauthenticatedInitialState } from "./initialState";

export * as actions from "./actions";
export * as hooks from "./hooks";
export * as initialState from "./initialState";
export * as selectors from "./selectors";
export * as tasks from "./tasks";

export const authenticatedActionMiddleware: Middleware<{}, Modules.StoreObj> = api => next => action => {
  const state = api.getState();
  if (redux.typeguards.isAuthenticatedStore(state)) {
    return next({ ...action, isAuthenticated: true });
  }
  return next({ ...action, isAuthenticated: false });
};

const configureGenericStore = <S extends Modules.StoreObj>(
  initialState: S,
  reducer: Redux.Reducer<S>,
  rootSaga: Saga<any[]>
): Redux.Store<S> => {
  const sentryReduxEnhancer = Sentry.createReduxEnhancer();

  // Create the redux-saga middleware that allows the sagas to run as side-effects
  // in the application.
  const sagaMiddleware = createSagaMiddleware();

  const store: Redux.Store<S> = createStore(
    reducer,
    initialState,
    compose(applyMiddleware(sagaMiddleware, authenticatedActionMiddleware), sentryReduxEnhancer)
  );

  // Start the application saga.
  sagaMiddleware.run(rootSaga);
  return store;
};

export const configureAuthenticatedStore = (user: Model.User): Redux.Store<Modules.Authenticated.StoreObj> => {
  const initialState = createAuthenticatedInitialState(GlobalReduxConfig, user);
  const applicationReducer = createAuthenticatedReducer(GlobalReduxConfig, user);
  const applicationSaga = createAuthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Modules.Authenticated.StoreObj>(initialState, applicationReducer, applicationSaga);
};

export const configureUnauthenticatedStore = (): Redux.Store<Modules.Unauthenticated.StoreObj> => {
  const initialState = createUnauthenticatedInitialState(GlobalReduxConfig);
  const applicationReducer = createUnauthenticatedReducer(GlobalReduxConfig);
  const applicationSaga = createUnauthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Modules.Unauthenticated.StoreObj>(initialState, applicationReducer, applicationSaga);
};
