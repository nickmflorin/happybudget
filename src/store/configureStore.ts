import { Middleware, createStore, applyMiddleware, compose, PreloadedState } from "redux";
import createSagaMiddleware, { Saga, SagaMiddlewareOptions } from "redux-saga";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import * as Sentry from "@sentry/react";

import { isAuthenticatedStore } from "lib/redux/typeguards";

import GlobalReduxConfig from "./config";
import createReducerManager from "./createReducerManager";
import { createStaticAuthenticatedReducers, createStaticUnauthenticatedReducers } from "./reducer";
import { createAuthenticatedRootSaga, createUnauthenticatedRootSaga } from "./sagas";
import { createAuthenticatedInitialState, createUnauthenticatedInitialState } from "./initialState";

export const history = createBrowserHistory();

const authenticatedActionMiddleware: Middleware<{}, Application.Store> = api => next => action => {
  const state = api.getState();
  if (isAuthenticatedStore(state)) {
    return next({ ...action, isAuthenticated: true });
  }
  return next({ ...action, isAuthenticated: false });
};

const configureGenericStore = <S extends Application.Store>(
  initialState: S,
  staticReducers: Redux.ReducersMapObject<S>,
  rootSaga: Saga<any[]>
): Redux.Store<S> => {
  /* Create the redux-saga middleware that allows the sagas to run as side-effects
     in the application.  If in a production environment, instruct the middleware
     to funnel errors through to Sentry. */
  let sagaMiddlewareOptions: SagaMiddlewareOptions = {};
  if (process.env.NODE_ENV === "production") {
    sagaMiddlewareOptions = { ...sagaMiddlewareOptions, onError: (error: Error) => Sentry.captureException(error) };
  }
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);

  let baseMiddleware: Middleware<{}, Application.Store>[] = [sagaMiddleware, authenticatedActionMiddleware];
  baseMiddleware =
    process.env.NODE_ENV !== "production"
      ? [require("redux-immutable-state-invariant").default(), ...baseMiddleware]
      : baseMiddleware;

  const reducerManager = createReducerManager<S>(staticReducers, initialState);

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  let enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)));
  if (process.env.NODE_ENV === "production") {
    const sentryReduxEnhancer = Sentry.createReduxEnhancer();
    enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)), sentryReduxEnhancer);
  }

  const store: Redux.Store<S> = {
    reducerManager,
    ...createStore<S, Redux.Action, any, any>(reducerManager.reduce, initialState as PreloadedState<S>, enhancers)
  };

  // Start the application saga.
  sagaMiddleware.run(rootSaga);
  return store;
};

export const configureAuthenticatedStore = (user: Model.User): Redux.Store<Application.Authenticated.Store> => {
  const initialState = createAuthenticatedInitialState(GlobalReduxConfig, user);
  const applicationReducers = createStaticAuthenticatedReducers(GlobalReduxConfig, user, history);
  const applicationSaga = createAuthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Application.Authenticated.Store>(initialState, applicationReducers, applicationSaga);
};

export const configureUnauthenticatedStore = (): Redux.Store<Application.Unauthenticated.Store> => {
  const initialState = createUnauthenticatedInitialState(GlobalReduxConfig);
  const applicationReducers = createStaticUnauthenticatedReducers(GlobalReduxConfig, history);
  const applicationSaga = createUnauthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Application.Unauthenticated.Store>(initialState, applicationReducers, applicationSaga);
};
