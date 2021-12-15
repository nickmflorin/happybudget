import { redux } from "lib";

export const initialFringesState: Tables.FringeTableStore = {
  ...redux.initialState.initialTableState,
  fringeColors: []
};

export const initialAnalysisState: Modules.Budget.AnalysisStore = {
  loading: false,
  responseWasReceived: false,
  accounts: {
    data: [],
    count: 0
  },
  actuals: {
    data: [],
    count: 0
  },
  groups: {
    data: [],
    count: 0
  }
};

export const initialSubAccountsTableState: Tables.SubAccountTableStore = {
  ...redux.initialState.initialTableState,
  fringes: initialFringesState,
  subaccountUnits: []
};

export const initialSubAccountState: Modules.Budget.SubAccountStore = {
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialAccountState: Modules.Budget.AccountStore = {
  detail: redux.initialState.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialHeaderTemplatesState: Modules.Budget.HeaderTemplatesStore = {
  ...redux.initialState.initialAuthenticatedModelListResponseState,
  displayedTemplate: null,
  loadingDetail: false
};

const initialState: Modules.Budget.Store = {
  detail: redux.initialState.initialDetailResponseState,
  account: initialAccountState,
  accounts: redux.initialState.initialTableState,
  subaccount: initialSubAccountState,
  headerTemplates: initialHeaderTemplatesState,
  analysis: initialAnalysisState,
  actuals: {
    ...redux.initialState.initialTableState,
    types: [],
    owners: redux.initialState.initialAuthenticatedModelListResponseState
  }
};

export default initialState;
