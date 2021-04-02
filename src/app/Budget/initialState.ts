import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialSubAccountGroupsState: Redux.Budget.IGroupsStore<any> = {
  deleting: [],
  ...initialListResponseState
};

export const initialSubAccountsState: Redux.Budget.ISubAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

export const initialBudgetState: Redux.Budget.IBudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  accounts: initialAccountsState,
  comments: initialCommentsListResponseState
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
  deleting: [],
  updating: [],
  creating: false,
  ...initialListResponseState
};

const initialState: Redux.Budget.IStore = {
  budget: initialBudgetState,
  instance: null,
  commentsHistoryDrawerOpen: false,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  actuals: initialActualsState,
  budgetItems: initialListResponseState,
  budgetItemsTree: initialListResponseState
};

export default initialState;
