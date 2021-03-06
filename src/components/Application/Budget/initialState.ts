import { initialDetailResponseState, initialListResponseState } from "store/initialState";

export const initialSubAccountState: Redux.Budget.ISubAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: {
    list: initialListResponseState,
    deleting: [],
    updating: [],
    creating: false,
    table: []
  }
};

export const initialAccountState: Redux.Budget.IAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: {
    list: initialListResponseState,
    deleting: [],
    updating: [],
    creating: false,
    table: []
  }
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  list: initialListResponseState,
  table: [],
  deleting: [],
  updating: [],
  creating: false,
  details: {}
};

const initialState: Redux.Budget.IStore = {
  budget: initialDetailResponseState,
  accounts: initialAccountsState,
  subaccounts: {},
  ancestors: [],
  ancestorsLoading: false
};

export default initialState;
