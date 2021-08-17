import { initialState, rootReducer, rootSaga } from "./store";

const Config: Modules.Authenticated.ModuleConfig<Modules.Authenticated.Budget.Store> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budget"
};

export default Config;
