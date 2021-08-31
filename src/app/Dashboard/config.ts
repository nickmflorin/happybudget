import { initialState, rootReducer, rootSaga } from "./store";

const Config: Modules.Authenticated.ModuleConfig<Modules.Authenticated.Dashboard.StoreObj> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
