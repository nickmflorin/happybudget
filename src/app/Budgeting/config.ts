import { initialState, reducers, sagas } from "./store";

export const TemplateReduxConfig: Application.ModuleConfig<Modules.Template.Store> = {
  rootReducer: reducers.templateRootReducer,
  rootSaga: sagas.templateRootSaga,
  initialState: initialState.initialTemplateState,
  label: "template"
};

export const BudgetReduxConfig: Application.ModuleConfig<Modules.Budget.Store> = {
  rootReducer: reducers.budgetRootReducer,
  rootSaga: sagas.budgetRootSaga,
  initialState: initialState.initialBudgetState,
  label: "budget"
};

export const PublicBudgetReduxConfig: Application.ModuleConfig<Modules.PublicBudget.Store> = {
  rootReducer: reducers.publicRootReducer,
  rootSaga: sagas.publicRootSaga,
  initialState: initialState.initialPublicBudgetState,
  label: "budget",
  isPublic: true
};
