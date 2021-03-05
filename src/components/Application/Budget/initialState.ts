import { initialDetailResponseState, initialListResponseState } from "store/initialState";

export const initialSubAccountState: Redux.Budget.ISubAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: initialListResponseState
};

export const initialAccountState: Redux.Budget.IAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: initialListResponseState
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  list: initialListResponseState,
  deleting: [],
  updating: [],
  creating: false,
  details: {}
};

const initialState: Redux.Budget.IStore = {
  budget: initialDetailResponseState,
  accounts: initialAccountsState,
  subaccounts: {}
};

export default initialState;
