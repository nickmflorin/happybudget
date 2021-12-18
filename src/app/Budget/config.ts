import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.AuthenticatedModuleConfig<Modules.Budget.Store> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "budget"
};

export default Config;
