import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Modules.ModuleConfig<Modules.Dashboard.Store, Redux.Action> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
