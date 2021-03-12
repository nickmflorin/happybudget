import { initialDetailResponseState, initialListResponseState, initialTableState } from "store/initialState";

export const initialSubAccountsState: Redux.Calculator.ISubAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export const initialAccountsState: Redux.Calculator.IAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false,
  comments: initialListResponseState
};

export const initialAccountState: Redux.Calculator.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialListResponseState
};

export const initialSubAccountState: Redux.Calculator.ISubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState,
  comments: initialListResponseState
};

const initialState: Redux.Calculator.IStore = {
  subaccount: initialSubAccountState,
  account: initialAccountState,
  accounts: initialAccountsState
};

export default initialState;
