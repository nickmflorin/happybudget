import {
  initialModelListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialBudgetBudgetState: Modules.Budget.BudgetStore<any> = {
  id: null,
  detail: initialDetailResponseState,
  children: initialModelListResponseState,
  groups: initialModelListResponseState,
  comments: initialCommentsListResponseState,
  history: initialModelListResponseState
};

export const initialSubAccountState: Modules.Budget.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  children: initialModelListResponseState,
  fringes: initialModelListResponseState,
  groups: initialModelListResponseState,
  comments: initialCommentsListResponseState,
  history: initialModelListResponseState
};

export const initialAccountState: Modules.Budget.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  children: initialModelListResponseState,
  fringes: initialModelListResponseState,
  groups: initialModelListResponseState,
  comments: initialCommentsListResponseState,
  history: initialModelListResponseState
};

export const initialHeaderTemplatesState: Modules.Budget.HeaderTemplatesStore = {
  ...initialModelListResponseState,
  displayedTemplate: null,
  loadingDetail: false
};

export const initialBudgetModuleState: Modules.Budget.ModuleStore<any> = {
  autoIndex: false,
  budget: initialBudgetBudgetState,
  commentsHistoryDrawerOpen: false,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  actuals: initialModelListResponseState,
  subAccountsTree: initialModelListResponseState,
  headerTemplates: initialHeaderTemplatesState
};

const initialState: Modules.Budget.Store = {
  budget: initialBudgetModuleState,
  template: initialBudgetModuleState,
  fringeColors: initialModelListResponseState,
  subaccountUnits: initialModelListResponseState
};

export default initialState;
