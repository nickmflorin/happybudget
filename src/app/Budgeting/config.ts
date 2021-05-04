import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Redux.ModuleConfig<Redux.Budgeting.Store, Redux.Action<any>> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budgeting"
};

export default Config;
