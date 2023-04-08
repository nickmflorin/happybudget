import { config } from "application";

import { initialState, rootReducer, rootSaga } from "./store";

const Config = config.moduleConfig({
  rootReducer: rootReducer,
  rootSaga: rootSaga,
  initialState: initialState,
  label: "dashboard" as const,
  isPublic: false,
});

export default Config;
