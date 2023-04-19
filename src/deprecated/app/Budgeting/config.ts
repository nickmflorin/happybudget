import { config } from "application";

import { initialState, reducers, sagas } from "./store";

export const TemplateReduxConfig = config.moduleConfig({
  rootReducer: reducers.templateRootReducer,
  rootSaga: sagas.templateRootSaga,
  initialState: initialState.initialTemplateState,
  label: "template" as const,
  isPublic: false,
});

export const BudgetReduxConfig = config.moduleConfig({
  rootReducer: reducers.budgetRootReducer,
  rootSaga: sagas.budgetRootSaga,
  initialState: initialState.initialBudgetState,
  label: "budget" as const,
  isPublic: false,
});

export const PublicBudgetReduxConfig = config.moduleConfig({
  rootReducer: reducers.publicRootReducer,
  rootSaga: sagas.publicRootSaga,
  initialState: initialState.initialPublicBudgetState,
  label: "public-budget" as const,
  isPublic: true,
});
