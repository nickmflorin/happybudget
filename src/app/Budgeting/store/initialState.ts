import {
  initialModelListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialBudgetAccountsState: Modules.Budgeting.Budget.AccountsStore = {
  history: initialModelListResponseState,
  groups: initialModelListResponseState,
  type: "account",
  ...initialModelListResponseState
};

export const initialTemplateAccountsState: Modules.Budgeting.Template.AccountsStore = {
  groups: initialModelListResponseState,
  type: "account",
  ...initialModelListResponseState
};

export const initialBudgetBudgetState: Modules.Budgeting.Budget.BudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  comments: initialCommentsListResponseState
};

export const initialTemplateTemplateState: Modules.Budgeting.Template.TemplateStore = {
  id: null,
  detail: initialDetailResponseState
};

export const initialBudgetSubAccountsState: Modules.Budgeting.Budget.SubAccountsStore = {
  history: initialModelListResponseState,
  groups: initialModelListResponseState,
  type: "subaccount",
  ...initialModelListResponseState
};

export const initialTemplateSubAccountsState: Modules.Budgeting.Template.SubAccountsStore = {
  groups: initialModelListResponseState,
  type: "subaccount",
  ...initialModelListResponseState
};

export const initialBudgetSubAccountState: Modules.Budgeting.Budget.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  type: "subaccount",
  comments: initialCommentsListResponseState,
  fringes: initialModelListResponseState
};

export const initialTemplateSubAccountState: Modules.Budgeting.Template.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  type: "subaccount",
  subaccounts: initialTemplateSubAccountsState,
  fringes: initialModelListResponseState
};

export const initialBudgetAccountState: Modules.Budgeting.Budget.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  type: "account",
  comments: initialCommentsListResponseState,
  fringes: initialModelListResponseState
};

export const initialTemplateAccountState: Modules.Budgeting.Template.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  type: "account",
  subaccounts: initialTemplateSubAccountsState,
  fringes: initialModelListResponseState
};

export const initialBudgetState: Modules.Budgeting.Budget.Store = {
  autoIndex: false,
  budget: initialBudgetBudgetState,
  commentsHistoryDrawerOpen: false,
  account: initialBudgetAccountState,
  subaccount: initialBudgetSubAccountState,
  actuals: initialModelListResponseState,
  accounts: initialBudgetAccountsState,
  subAccountsTree: initialModelListResponseState
};

export const initialTemplateState: Modules.Budgeting.Template.Store = {
  autoIndex: false,
  template: initialTemplateTemplateState,
  account: initialTemplateAccountState,
  subaccount: initialTemplateSubAccountState,
  accounts: initialTemplateAccountsState
};

const initialState: Modules.Budgeting.Store = {
  budget: initialBudgetState,
  template: initialTemplateState,
  fringeColors: initialModelListResponseState,
  subaccountUnits: initialModelListResponseState
};

export default initialState;
