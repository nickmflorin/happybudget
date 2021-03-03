import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Budget.IStore, Redux.Budget.IAction> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "budget"
};

export default Config;
