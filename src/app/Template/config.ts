import { initialState, rootReducer, rootSaga } from "./store";

const Config: Application.Authenticated.ModuleConfig<Modules.Template.Store> = {
  rootReducer,
  rootSaga,
  initialState,
  label: "template"
};

export default Config;
