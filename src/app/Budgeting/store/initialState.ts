import { redux } from "lib";

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

export const initialSubAccountState: Modules.SubAccountStore = {
  detail: redux.initialDetailResponseState,
  table: redux.initialTableState
};

export const initialAccountState: Modules.AccountStore = {
  detail: redux.initialDetailResponseState,
  table: redux.initialTableState
};

export const initialBudgetState: Modules.Budget.Store = {
  detail: redux.initialDetailResponseState,
  account: {},
  accounts: redux.initialTableState,
  subaccount: {},
  fringes: redux.initialTableState,
  analysis: initialAnalysisState,
  actuals: {
    ...redux.initialTableState,
    owners: redux.initialAuthenticatedModelListResponseState
  }
};

export const initialTemplateState: Modules.Template.Store = {
  detail: redux.initialDetailResponseState,
  account: {},
  subaccount: {},
  accounts: redux.initialTableState,
  fringes: redux.initialTableState
};

export const initialPublicBudgetState: Modules.PublicBudget.Store = {
  detail: redux.initialDetailResponseState,
  account: {},
  accounts: redux.initialTableState,
  subaccount: {},
  fringes: redux.initialTableState
};
