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

export const initialSubAccountState: Modules.Budget.SubAccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialAccountState: Modules.Budget.AccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialHeaderTemplatesState: Modules.Budget.HeaderTemplatesStore = {
  ...redux.initialState.initialAuthenticatedModelListResponseState,
  displayedTemplate: null,
  loadingDetail: false
};

const initialState: Modules.Budget.Store = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  headerTemplates: initialHeaderTemplatesState,
  actuals: {
    ...redux.initialState.initialTableState,
    types: [],
    owners: redux.initialState.initialAuthenticatedModelListResponseState
  }
};

export default initialState;
