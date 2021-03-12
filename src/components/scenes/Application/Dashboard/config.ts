import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Dashboard.IStore, Redux.IAction> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
