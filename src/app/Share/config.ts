import { initialState, rootReducer } from "./store";

const Config: Application.PublicModuleConfig = {
  rootReducer,
  initialState,
  label: "share",
  isPublic: true
};

export default Config;
