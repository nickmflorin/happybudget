import {
  initialListResponseState,
  initialDetailResponseState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.IGroupsStore<any> = {
  deleting: [],
  ...initialListResponseState
};

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

export const initialAccountsState: Redux.Calculator.IAccountsStore = {
  placeholders: [],
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState,
  ...initialListResponseState
};

const initialBudgetState: Redux.Calculator.IBudgetStore = {
  accounts: initialAccountsState,
  comments: initialCommentsListResponseState
};

const initialSubAccountState: Redux.Calculator.ISubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

const initialAccountState: Redux.Calculator.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  budget: initialBudgetState
};

export default initialState;
