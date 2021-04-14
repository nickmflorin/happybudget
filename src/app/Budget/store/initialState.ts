import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialFringesState: Redux.Budget.FringesStore = {
  placeholders: [],
  ...initialListResponseState
};

export const initialAccountsState: Redux.Budget.AccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  ...initialListResponseState
};

export const initialBudgetState: Redux.Budget.BudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  comments: initialCommentsListResponseState
};

export const initialSubAccountsState: Redux.Budget.SubAccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  fringes: initialFringesState,
  ...initialListResponseState
};

export const initialSubAccountState: Redux.Budget.SubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialAccountState: Redux.Budget.AccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialActualsState: Redux.Budget.ActualsStore = {
  placeholders: [],
  ...initialListResponseState
};

const initialState: Redux.Budget.Store = {
  budget: initialBudgetState,
  instance: null,
  commentsHistoryDrawerOpen: false,
  fringes: initialFringesState,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  actuals: initialActualsState,
  accounts: initialAccountsState,
  budgetItems: initialListResponseState,
  budgetItemsTree: initialListResponseState
};

export default initialState;
