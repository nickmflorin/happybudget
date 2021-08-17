import { initialState, rootReducer, rootSaga } from "./store";

const Config: Modules.Unauthenticated.ModuleConfig = {
  rootReducer,
  rootSaga,
  initialState,
  label: "share",
  isUnauthenticated: true
};

export default Config;
