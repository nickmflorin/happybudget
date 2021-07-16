import initialState from "./store/initialState";
import rootReducer from "./store/reducer";
import rootSaga from "./store/sagas";

const Config: Modules.ModuleConfig<Modules.Budget.Store, Redux.Action<any>> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budget"
};

export default Config;
