import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Modules.ModuleConfig<Modules.Budgeting.Store, Redux.Action<any>> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budgeting"
};

export default Config;
