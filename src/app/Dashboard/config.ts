import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.AuthenticatedModuleConfig<Modules.Dashboard.Store> = {
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard"
};

export default Config;
