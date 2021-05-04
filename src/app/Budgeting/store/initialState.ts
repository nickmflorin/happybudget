import {
  initialModelListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialFringesState: Redux.Budgeting.Budget.FringesStore | Redux.Budgeting.Template.FringesStore = {
  placeholders: [],
  ...initialModelListResponseState
};

export const initialBudgetAccountsState: Redux.Budgeting.Budget.AccountsStore = {
  history: initialModelListResponseState,
  groups: initialModelListResponseState,
  ...initialModelListResponseState
};

export const initialTemplateAccountsState: Redux.Budgeting.Template.AccountsStore = {
  groups: initialModelListResponseState,
  ...initialModelListResponseState
};

export const initialBudgetBudgetState: Redux.Budgeting.Budget.BudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  comments: initialCommentsListResponseState
};

export const initialTemplateTemplateState: Redux.Budgeting.Template.TemplateStore = {
  id: null,
  detail: initialDetailResponseState
};

export const initialBudgetSubAccountsState: Redux.Budgeting.Budget.SubAccountsStore = {
  history: initialModelListResponseState,
  groups: initialModelListResponseState,
  fringes: initialFringesState,
  ...initialModelListResponseState
};

export const initialTemplateSubAccountsState: Redux.Budgeting.Template.SubAccountsStore = {
  groups: initialModelListResponseState,
  fringes: initialFringesState,
  ...initialModelListResponseState
};

export const initialBudgetSubAccountState: Redux.Budgeting.Budget.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialTemplateSubAccountState: Redux.Budgeting.Template.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialTemplateSubAccountsState
};

export const initialBudgetAccountState: Redux.Budgeting.Budget.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialTemplateAccountState: Redux.Budgeting.Template.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialTemplateSubAccountsState
};

export const initialActualsState: Redux.Budgeting.Budget.ActualsStore = {
  placeholders: [],
  ...initialModelListResponseState
};

export const initialBudgetState: Redux.Budgeting.Budget.Store = {
  budget: initialBudgetBudgetState,
  instance: null,
  commentsHistoryDrawerOpen: false,
  fringes: initialFringesState,
  account: initialBudgetAccountState,
  subaccount: initialBudgetSubAccountState,
  actuals: initialActualsState,
  accounts: initialBudgetAccountsState,
  budgetItems: initialModelListResponseState,
  budgetItemsTree: initialModelListResponseState
};

export const initialTemplateState: Redux.Budgeting.Template.Store = {
  template: initialTemplateTemplateState,
  instance: null,
  fringes: initialFringesState,
  account: initialTemplateAccountState,
  subaccount: initialTemplateSubAccountState,
  accounts: initialTemplateAccountsState
};

const initialState: Redux.Budgeting.Store = {
  budget: initialBudgetState,
  template: initialTemplateState,
  fringeColors: initialModelListResponseState
};

export default initialState;
