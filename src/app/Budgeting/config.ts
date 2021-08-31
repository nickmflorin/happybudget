import { initialState, rootReducer, rootSaga } from "./store";

const Config: Modules.Authenticated.ModuleConfig<Modules.Authenticated.Budget.StoreObj> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budget"
};

export default Config;
