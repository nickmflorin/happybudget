import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Redux.IModuleConfig<Redux.Budget.IStore, Redux.IAction<any>> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "budget"
};

export default Config;
