import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialFringesState: Redux.Budget.IFringesStore = {
  placeholders: [],
  ...initialListResponseState
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  ...initialListResponseState
};

export const initialBudgetState: Redux.Budget.IBudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  comments: initialCommentsListResponseState
};

export const initialSubAccountsState: Redux.Budget.ISubAccountsStore = {
  placeholders: [],
  history: initialListResponseState,
  groups: initialListResponseState,
  fringes: initialFringesState,
  ...initialListResponseState
};

export const initialSubAccountState: Redux.Budget.ISubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialAccountState: Redux.Budget.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialActualsState: Redux.Budget.IActualsStore = {
  placeholders: [],
  ...initialListResponseState
};

const initialState: Redux.Budget.IStore = {
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
