import { Store, Reducer, createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";

import ApplicationReduxConfig from "./config";
import createApplicationReducer from "./reducer";
import createRootSaga from "./sagas";
import createRootInitialState from "./initialState";

const configureStore = (user: IUser): Store<Redux.IApplicationStore, Redux.IAction<any>> => {
  const initialState = createRootInitialState(ApplicationReduxConfig, user);

  const applicationReducer = createApplicationReducer(ApplicationReduxConfig, user) as Reducer<
    Redux.IApplicationStore,
    Redux.IAction
  >;
  const applicationSaga = createRootSaga(ApplicationReduxConfig);

  const sagaMiddleware = createSagaMiddleware();
  const store: Store<Redux.IApplicationStore, Redux.IAction<any>> = createStore(
    applicationReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(applicationSaga);
  return store;
};

export default configureStore;
