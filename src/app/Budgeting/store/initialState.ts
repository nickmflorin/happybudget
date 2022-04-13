import { redux } from "lib";

export const initialFringesState: Tables.FringeTableStore = {
  ...redux.initialTableState,
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
  ...redux.initialTableState,
  fringes: initialFringesState,
  subaccountUnits: []
};

export const initialSubAccountState: Modules.SubAccountStore = {
  detail: redux.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialAccountState: Modules.AccountStore = {
  detail: redux.initialDetailResponseState,
  table: initialSubAccountsTableState
};

export const initialBudgetState: Modules.Budget.Store = {
  detail: redux.initialDetailResponseState,
  account: initialAccountState,
  accounts: redux.initialTableState,
  subaccount: initialSubAccountState,
  analysis: initialAnalysisState,
  actuals: {
    ...redux.initialTableState,
    types: [],
    owners: redux.initialAuthenticatedModelListResponseState
  }
};

export const initialTemplateState: Modules.Template.Store = {
  detail: redux.initialDetailResponseState,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  accounts: redux.initialTableState
};

export const initialPublicBudgetState: Modules.PublicBudget.Store = {
  detail: redux.initialDetailResponseState,
  account: initialAccountState,
  accounts: redux.initialTableState,
  subaccount: initialSubAccountState
};
