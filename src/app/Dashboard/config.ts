import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Redux.ModuleConfig<Redux.Dashboard.Store, Redux.Action> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
