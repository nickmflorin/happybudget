import { configureStore as configureRootStore, applyMiddleware } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";
import { type Middleware, type StoreEnhancer } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware, { SagaMiddlewareOptions } from "redux-saga";

import { createApplicationReducer } from "./reducer";
import { createApplicationSaga, createSagaManager } from "./sagas";

import { createApplicationInitialState } from "../../application/store/initialState";
import * as types from "../../application/store/types";

type MD = Middleware<Record<string, unknown>, types.ApplicationStore>;

const publicActionMiddleware: MD = api => next => (action: types.Action) => {
  const state = api.getState();
  return next({ ...action, context: { ...action.context, publicTokenId: state.public.tokenId } });
};

const userActionMiddleware: MD = api => next => (action: types.Action) => {
  const state = api.getState();
  return next({ ...action, user: state.user });
};

const configureStore = (c: types.StoreConfig): types.Store<types.ApplicationStore> => {
  const initialState = createApplicationInitialState(c);
  const applicationReducer = createApplicationReducer(c);
  const applicationSaga = createApplicationSaga();

  /* If in a production environment, instruct the redux-sagas middleware to funnel errors through to
     Sentry. */
  let sagaMiddlewareOptions: SagaMiddlewareOptions = {};
  if (process.env.NODE_ENV === "production") {
    sagaMiddlewareOptions = {
      ...sagaMiddlewareOptions,
      onError: (error: Error) => Sentry.captureException(error),
    };
  }
  /* Create the redux-saga middleware that allows the sagas to run as side-effects in the
     application. */
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);

  let baseMiddleware: MD[] = [publicActionMiddleware, userActionMiddleware, sagaMiddleware];
  if (process.env.NODE_ENV === "development") {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    baseMiddleware = [require("redux-immutable-state-invariant").default(), ...baseMiddleware];
  }

  const middleware = applyMiddleware(...baseMiddleware);

  let enhancers: [StoreEnhancer] | undefined = undefined;
  if (process.env.NODE_ENV === "development") {
    enhancers = [composeWithDevTools(middleware)];
  } else if (process.env.NODE_ENV === "production") {
    enhancers = [Sentry.createReduxEnhancer()];
  }

  const store: Omit<
    types.Store<types.ApplicationStore>,
    "injectSaga" | "ejectSaga" | "hasSaga"
  > = configureRootStore<types.ApplicationStore, types.Action>({
    reducer: applicationReducer,
    devTools: process.env.NODE_ENV === "development",
    preloadedState: initialState,
    enhancers,
  });

  /* Start the application saga and establish the saga injector.  This must be done after the store
     is configured, because the SagaMiddleware must be mounted to run the root saga. */
  const [injectSaga, ejectSaga, hasSaga] = createSagaManager(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (saga: any, ...args: Parameters<any>) => sagaMiddleware.run(saga, ...args),
    applicationSaga,
  );
  return { ...store, injectSaga, ejectSaga, hasSaga };
};

export default configureStore;
