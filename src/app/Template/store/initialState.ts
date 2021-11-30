import { redux } from "lib";

export const initialFringesState: Tables.FringeTableStore = {
  ...redux.initialState.initialTableState,
  fringeColors: []
};

export const initialSubAccountsTableState: Tables.SubAccountTableStore = {
  ...redux.initialState.initialTableState,
  fringes: initialFringesState,
  subaccountUnits: []
};

export const initialSubAccountState: Modules.Template.SubAccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialAccountState: Modules.Template.AccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

const initialState: Modules.Template.Store = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  account: initialAccountState,
  subaccount: initialSubAccountState
};

export default initialState;
