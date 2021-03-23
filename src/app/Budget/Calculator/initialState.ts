import {
  initialDetailResponseState,
  initialListResponseState,
  initialTableState,
  initialCommentsListResponseState
} from "store/initialState";

export const initialSubAccountGroupsState: Redux.Calculator.ISubAccountGroupsStore = {
  deleting: []
};

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false,
  history: initialListResponseState,
  groups: initialSubAccountGroupsState
};

export const initialAccountsState: Redux.Calculator.IAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false,
  comments: initialCommentsListResponseState,
  history: initialListResponseState
};

export const initialAccountState: Redux.Calculator.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

export const initialSubAccountState: Redux.Calculator.ISubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialCommentsListResponseState
};

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  accounts: initialAccountsState
};

export default initialState;
