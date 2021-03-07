import { initialDetailResponseState, initialTableState } from "store/initialState";

export const initialSubAccountState: Redux.Budget.ISubAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: {
    deleting: [],
    updating: [],
    creating: false,
    table: initialTableState
  }
};

export const initialAccountState: Redux.Budget.IAccountStore = {
  detail: initialDetailResponseState,
  subaccounts: {
    deleting: [],
    updating: [],
    creating: false,
    table: initialTableState
  }
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  table: initialTableState,
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
