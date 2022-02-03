import { Middleware, createStore, applyMiddleware, compose, PreloadedState } from "redux";
import createSagaMiddleware, { SagaMiddlewareOptions } from "redux-saga";
import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory, History } from "history";
import * as Sentry from "@sentry/react";

import ModuleConfig from "./config";
import createSagaManager from "./createSagaManager";
import createApplicationReducer from "./reducer";
import createApplicationSaga from "./sagas";
import createApplicationInitialState from "./initialState";

export const history: History<unknown> = createBrowserHistory();

type MD = Middleware<Record<string, unknown>, Application.Store>;

const publicActionMiddleware: MD = api => next => (action: Redux.Action) => {
  const state = api.getState();
  return next({ ...action, context: { ...action.context, publicTokenId: state.public.tokenId } });
};

const configureStore = (
  config: Omit<Application.StoreConfig, "history" | "modules">
): Redux.Store<Application.Store> => {
  const initialState = createApplicationInitialState({ ...config, modules: ModuleConfig, history });
  const applicationReducer = createApplicationReducer({ ...config, modules: ModuleConfig, history });
  const applicationSaga = createApplicationSaga({ ...config, modules: ModuleConfig, history });

  /* Create the redux-saga middleware that allows the sagas to run as side-effects
     in the application.  If in a production environment, instruct the middleware
     to funnel errors through to Sentry. */
  let sagaMiddlewareOptions: SagaMiddlewareOptions = {};
  if (process.env.NODE_ENV === "production") {
    sagaMiddlewareOptions = { ...sagaMiddlewareOptions, onError: (error: Error) => Sentry.captureException(error) };
  }
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);

  let baseMiddleware: MD[] = [publicActionMiddleware, sagaMiddleware];
  baseMiddleware =
    process.env.NODE_ENV !== "production"
      ? /* eslint-disable-next-line @typescript-eslint/no-var-requires */
        [require("redux-immutable-state-invariant").default(), ...baseMiddleware]
      : baseMiddleware;

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  let enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)));
  if (process.env.NODE_ENV === "production") {
    const sentryReduxEnhancer = Sentry.createReduxEnhancer();
    enhancers = composeEnhancers(applyMiddleware(...baseMiddleware, routerMiddleware(history)), sentryReduxEnhancer);
  }

  const store: Omit<Redux.Store<Application.Store>, "injectSaga" | "ejectSaga"> = createStore<
    Application.Store,
    Redux.Action,
    typeof composeEnhancers,
    never
  >(applicationReducer, initialState as PreloadedState<Application.Store>, enhancers);

  /* Start the application saga and establish the saga injector.  We must do this
     after we create the store, because the SagaMiddleware must be mounted to
     run the root saga. */
  const [injectSaga, ejectSaga, hasSaga] = createSagaManager(sagaMiddleware.run, applicationSaga);
  return { ...store, injectSaga, ejectSaga, hasSaga };
};

export default configureStore;
