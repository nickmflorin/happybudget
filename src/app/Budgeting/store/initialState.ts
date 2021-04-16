import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialFringesState: Redux.Budget.FringesStore | Redux.Template.FringesStore = {
  placeholders: [],
  ...initialListResponseState
};

export const initialBudgetAccountsState: Redux.Budget.AccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  ...initialListResponseState
};

export const initialTemplateAccountsState: Redux.Template.AccountsStore = {
  placeholders: [],
  groups: initialListResponseState,
  ...initialListResponseState
};

export const initialBudgetBudgetState: Redux.Budget.BudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  comments: initialCommentsListResponseState
};

export const initialTemplateTemplateState: Redux.Template.TemplateStore = {
  id: null,
  detail: initialDetailResponseState
};

export const initialBudgetSubAccountsState: Redux.Budget.SubAccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  fringes: initialFringesState,
  ...initialListResponseState
};

export const initialTemplateSubAccountsState: Redux.Template.SubAccountsStore = {
  placeholders: [],
  groups: initialListResponseState,
  fringes: initialFringesState,
  ...initialListResponseState
};

export const initialBudgetSubAccountState: Redux.Budget.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialTemplateSubAccountState: Redux.Template.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialTemplateSubAccountsState
};

export const initialBudgetAccountState: Redux.Budget.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialBudgetSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialTemplateAccountState: Redux.Template.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialTemplateSubAccountsState
};

export const initialActualsState: Redux.Budget.ActualsStore = {
  placeholders: [],
  ...initialListResponseState
};

export const initialBudgetState: Redux.Budget.Store = {
  budget: initialBudgetBudgetState,
  instance: null,
  commentsHistoryDrawerOpen: false,
  fringes: initialFringesState,
  account: initialBudgetAccountState,
  subaccount: initialBudgetSubAccountState,
  actuals: initialActualsState,
  accounts: initialBudgetAccountsState,
  budgetItems: initialListResponseState,
  budgetItemsTree: initialListResponseState
};

export const initialTemplateState: Redux.Template.Store = {
  template: initialTemplateTemplateState,
  instance: null,
  fringes: initialFringesState,
  account: initialBudgetAccountState,
  subaccount: initialBudgetSubAccountState,
  accounts: initialTemplateAccountsState
};

const initialState = {
  budget: initialBudgetState,
  template: initialTemplateState
};

export default initialState;
