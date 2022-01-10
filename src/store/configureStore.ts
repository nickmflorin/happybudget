import { Middleware, createStore, applyMiddleware, compose, PreloadedState } from "redux";
import createSagaMiddleware, { Saga, SagaMiddlewareOptions } from "redux-saga";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory, History } from "history";
import * as Sentry from "@sentry/react";

import { isAuthenticatedStore } from "lib/redux/typeguards";

import GlobalReduxConfig from "./config";
import createReducerManager from "./createReducerManager";
import createSagaManager from "./createSagaManager";
import { createStaticAuthenticatedReducers, createStaticUnauthenticatedReducers } from "./reducer";
import { createAuthenticatedRootSaga, createUnauthenticatedRootSaga } from "./sagas";
import { createAuthenticatedInitialState, createUnauthenticatedInitialState } from "./initialState";

export const history: History<unknown> = createBrowserHistory();

type MD = Middleware<Record<string, unknown>, Application.Store>;

const authenticatedActionMiddleware: MD = api => next => action => {
  const state = api.getState();
  if (isAuthenticatedStore(state)) {
    return next({ ...action, isAuthenticated: true });
  }
  return next({ ...action, isAuthenticated: false });
};

const configureGenericStore = <S extends Application.Store>(
  initialState: S,
  staticReducers: Redux.ReducersMapObject<S>,
  rootSaga: Saga
): Redux.Store<S> => {
  /* Create the redux-saga middleware that allows the sagas to run as side-effects
     in the application.  If in a production environment, instruct the middleware
     to funnel errors through to Sentry. */
  let sagaMiddlewareOptions: SagaMiddlewareOptions = {};
  if (process.env.NODE_ENV === "production") {
    sagaMiddlewareOptions = { ...sagaMiddlewareOptions, onError: (error: Error) => Sentry.captureException(error) };
  }
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);

  let baseMiddleware: MD[] = [sagaMiddleware, authenticatedActionMiddleware];
  baseMiddleware =
    process.env.NODE_ENV !== "production"
      ? /* eslint-disable-next-line @typescript-eslint/no-var-requires */
        [require("redux-immutable-state-invariant").default(), ...baseMiddleware]
      : baseMiddleware;

  const reducerManager = createReducerManager<S>(staticReducers, initialState);

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  let enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)));
  if (process.env.NODE_ENV === "production") {
    const sentryReduxEnhancer = Sentry.createReduxEnhancer();
    enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)), sentryReduxEnhancer);
  }

  const store: Omit<Redux.Store<S>, "injectSaga" | "ejectSaga"> = {
    reducerManager,
    ...createStore<S, Redux.Action, typeof composeEnhancers, never>(
      reducerManager.reduce,
      initialState as PreloadedState<S>,
      enhancers
    )
  };

  /* Start the application saga and establish the saga injector.  We must do this
     after we create the store, because the SagaMiddleware must be mounted to
     run the root saga. */
  const [injectSaga, ejectSaga, hasSaga] = createSagaManager(sagaMiddleware.run, rootSaga);
  return { ...store, injectSaga, ejectSaga, hasSaga };
};

export const configureAuthenticatedStore = (user: Model.User): Redux.Store<Application.AuthenticatedStore> => {
  const initialState = createAuthenticatedInitialState(GlobalReduxConfig, user);
  const applicationReducers = createStaticAuthenticatedReducers(GlobalReduxConfig, user, history);
  const applicationSaga = createAuthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Application.AuthenticatedStore>(
    initialState,
    applicationReducers as Redux.ReducersMapObject<Application.AuthenticatedStore>,
    applicationSaga
  );
};

export const configureUnauthenticatedStore = (): Redux.Store<Application.UnauthenticatedStore> => {
  const initialState = createUnauthenticatedInitialState(GlobalReduxConfig);
  const applicationReducers = createStaticUnauthenticatedReducers(GlobalReduxConfig);
  const applicationSaga = createUnauthenticatedRootSaga(GlobalReduxConfig);
  return configureGenericStore<Application.UnauthenticatedStore>(initialState, applicationReducers, applicationSaga);
};
