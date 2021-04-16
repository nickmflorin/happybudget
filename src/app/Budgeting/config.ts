import initialState from "./store/initialState";
import { templateRootReducer, budgetRootReducer } from "./store/reducer";
import { budgetRootSaga, templateRootSaga } from "./store/sagas";

const BudgetConfig: Redux.ModuleConfig<Redux.Budget.Store, Redux.Action<any>> = {
  rootReducer: budgetRootReducer,
  rootSaga: budgetRootSaga,
  initialState: initialState.budget,
  label: "budget"
};

const TemplateConfig: Redux.ModuleConfig<Redux.Template.Store, Redux.Action<any>> = {
  rootReducer: templateRootReducer,
  rootSaga: templateRootSaga,
  initialState: initialState.template,
  label: "template"
};

const Config = {
  budget: BudgetConfig,
  template: TemplateConfig
};

export default Config;
