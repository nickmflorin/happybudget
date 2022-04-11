import { Middleware, StoreEnhancer, createStore, applyMiddleware, compose, PreloadedState } from "redux";
import createSagaMiddleware, { SagaMiddlewareOptions } from "redux-saga";
import * as Sentry from "@sentry/react";

import ModuleConfig from "./config";
import createSagaManager from "./createSagaManager";
import createApplicationReducer from "./reducer";
import createApplicationSaga from "./sagas";
import createApplicationInitialState from "./initialState";

type MD = Middleware<Record<string, unknown>, Application.Store>;

const publicActionMiddleware: MD = api => next => (action: Redux.Action) => {
  const state = api.getState();
  return next({ ...action, context: { ...action.context, publicTokenId: state.public.tokenId } });
};

const userActionMiddleware: MD = api => next => (action: Redux.Action) => {
  const state = api.getState();
  return next({ ...action, user: state.user });
};

const configureStore = (config: Omit<Application.StoreConfig, "modules">): Redux.Store<Application.Store> => {
  const initialState = createApplicationInitialState({ ...config, modules: ModuleConfig });
  const applicationReducer = createApplicationReducer({ ...config, modules: ModuleConfig });
  const applicationSaga = createApplicationSaga({ ...config, modules: ModuleConfig });

  /* Create the redux-saga middleware that allows the sagas to run as side-effects
     in the application.  If in a production environment, instruct the middleware
     to funnel errors through to Sentry. */
  let sagaMiddlewareOptions: SagaMiddlewareOptions = {};
  if (process.env.NODE_ENV === "production") {
    sagaMiddlewareOptions = { ...sagaMiddlewareOptions, onError: (error: Error) => Sentry.captureException(error) };
  }
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);

  let baseMiddleware: MD[] = [publicActionMiddleware, userActionMiddleware, sagaMiddleware];
  baseMiddleware =
    process.env.NODE_ENV !== "production"
      ? /* eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-call */
        [require("redux-immutable-state-invariant").default(), ...baseMiddleware]
      : baseMiddleware;

  const composeEnhancers = (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ as typeof compose) || compose;
  let enhancers = composeEnhancers(applyMiddleware(...baseMiddleware));
  if (process.env.NODE_ENV === "production") {
    const sentryReduxEnhancer: StoreEnhancer<{
      dispatch: unknown;
    }> = Sentry.createReduxEnhancer();
    enhancers = composeEnhancers(applyMiddleware(...baseMiddleware), sentryReduxEnhancer);
  }

  const store: Omit<Redux.Store<Application.Store>, "injectSaga" | "ejectSaga" | "hasSaga"> = createStore<
    Application.Store,
    Redux.Action,
    { dispatch: unknown },
    never
  >(applicationReducer, initialState as PreloadedState<Application.Store>, enhancers);

  /* Start the application saga and establish the saga injector.  We must do this
     after we create the store, because the SagaMiddleware must be mounted to
     run the root saga. */
  const [injectSaga, ejectSaga, hasSaga] = createSagaManager(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (saga: any, ...args: Parameters<any>) => sagaMiddleware.run(saga, ...args),
    applicationSaga
  );
  return { ...store, injectSaga, ejectSaga, hasSaga };
};

export default configureStore;
