import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.Authenticated.ModuleConfig<Modules.Dashboard.Store> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
