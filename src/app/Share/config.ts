import { initialState, rootReducer } from "./store";

const Config: Application.UnauthenticatedModuleConfig = {
  rootReducer,
  initialState,
  label: "share",
  isUnauthenticated: true
};

export default Config;
