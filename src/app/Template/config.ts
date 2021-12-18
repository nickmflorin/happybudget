import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.AuthenticatedModuleConfig<Modules.Template.Store> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "template"
};

export default Config;
