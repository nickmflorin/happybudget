import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.Authenticated.ModuleConfig<Modules.Budget.Store> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budget"
};

export default Config;
