import { initialDetailResponseState, initialTableState } from "store/initialState";

export const initialSubAccountsState: Redux.Budget.ISubAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export const initialAccountsState: Redux.Budget.IAccountsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export const initialActualsState: Redux.Budget.IActualsStore = {
  table: initialTableState,
  deleting: [],
  updating: [],
  creating: false
};

export const initialBudgetState: Redux.Budget.IBudgetStore = {
  id: null,
  detail: initialDetailResponseState,
  accounts: initialAccountsState
};

export const initialAccountState: Redux.Budget.IAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState
};

export const initialSubAccountState: Redux.Budget.ISubAccountStore = {
  id: null,
  detail: initialDetailResponseState,
  subaccounts: initialSubAccountsState
};

const initialState: Redux.Budget.IStore = {
  budget: initialBudgetState,
  subaccount: initialSubAccountState,
  account: initialAccountState,
  ancestors: [],
  ancestorsLoading: false,
  actuals: initialActualsState
};

export default initialState;
