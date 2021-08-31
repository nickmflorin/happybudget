import { redux } from "lib";

export const initialBudgetBudgetState: Modules.Authenticated.Budget.BudgetStore<any> = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialBudgetTableState,
  comments: redux.initialState.initialCommentsListResponseState,
  history: redux.initialState.initialModelListResponseState
};

export const initialSubAccountState: Modules.Authenticated.Budget.SubAccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialBudgetTableWithFringesState,
  comments: redux.initialState.initialCommentsListResponseState,
  history: redux.initialState.initialModelListResponseState
};

export const initialAccountState: Modules.Authenticated.Budget.AccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialBudgetTableWithFringesState,
  comments: redux.initialState.initialCommentsListResponseState,
  history: redux.initialState.initialModelListResponseState
};

export const initialHeaderTemplatesState: Modules.Authenticated.Budget.HeaderTemplatesStore = {
  ...redux.initialState.initialModelListResponseState,
  displayedTemplate: null,
  loadingDetail: false
};

export const initialBudgetModuleState: Modules.Authenticated.Budget.ModuleStore<any> = {
  autoIndex: false,
  budget: initialBudgetBudgetState,
  commentsHistoryDrawerOpen: false,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  actuals: redux.initialState.initialModelListResponseState,
  subAccountsTree: redux.initialState.initialModelListResponseState,
  headerTemplates: initialHeaderTemplatesState
};

const initialState: Modules.Authenticated.Budget.StoreObj = {
  budget: initialBudgetModuleState,
  template: initialBudgetModuleState,
  fringeColors: redux.initialState.initialModelListResponseState
};

export default initialState;
