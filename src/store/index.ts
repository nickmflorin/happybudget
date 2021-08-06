import { Store, Reducer, createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import * as Sentry from "@sentry/react";

import ApplicationReduxConfig from "./config";
import createApplicationReducer from "./reducer";
import createRootSaga from "./sagas";
import createRootInitialState from "./initialState";

export * as actions from "./actions";
export * as hooks from "./hooks";
export * as initialState from "./initialState";
export * as tasks from "./tasks";
export * as selectors from "./selectors";

const configureStore = (user: Model.User): Store<Modules.ApplicationStore, Redux.Action<any>> => {
  const initialState = createRootInitialState(ApplicationReduxConfig, user);

  const sentryReduxEnhancer = Sentry.createReduxEnhancer();

  const applicationReducer = createApplicationReducer(ApplicationReduxConfig, user) as Reducer<
    Modules.ApplicationStore,
    Redux.Action
  >;
  const applicationSaga = createRootSaga(ApplicationReduxConfig);

  const sagaMiddleware = createSagaMiddleware();

  const store: Store<Modules.ApplicationStore, Redux.Action<any>> = createStore(
    applicationReducer,
    initialState,
    compose(applyMiddleware(sagaMiddleware), sentryReduxEnhancer)
  );

  sagaMiddleware.run(applicationSaga);
  return store;
};

export default configureStore;
