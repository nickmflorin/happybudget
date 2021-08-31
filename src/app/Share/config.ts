import { initialState, rootReducer } from "./store";

const Config: Application.Unauthenticated.ModuleConfig = {
  rootReducer,
  initialState,
  label: "share",
  isUnauthenticated: true
};

export default Config;
