import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Budgets.IStore, Redux.IAction> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "budgets"
};

export default Config;
