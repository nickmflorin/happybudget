import initialState from "./initialState";
import rootReducer from "./reducer";
import rootSaga from "./sagas";

const Config: Redux.IModuleConfig<Redux.Calculator.IStore, Redux.IAction<any>> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "calculator"
};

export default Config;
