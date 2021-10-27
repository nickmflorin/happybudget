import { redux } from "lib";

export const initialSubAccountState: Modules.Budget.SubAccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  comments: {
    ...redux.initialState.initialAuthenticatedModelListResponseState,
    replying: []
  },
  history: redux.initialState.initialModelListResponseState,
  table: {
    ...redux.initialState.initialTableState,
    fringes: {
      ...redux.initialState.initialTableState,
      fringeColors: []
    },
    subaccountUnits: []
  }
};

export const initialAccountState: Modules.Budget.AccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  comments: {
    ...redux.initialState.initialAuthenticatedModelListResponseState,
    replying: []
  },
  history: redux.initialState.initialModelListResponseState,
  table: {
    ...redux.initialState.initialTableState,
    fringes: {
      ...redux.initialState.initialTableState,
      fringeColors: []
    },
    subaccountUnits: []
  }
};

export const initialHeaderTemplatesState: Modules.Budget.HeaderTemplatesStore = {
  ...redux.initialState.initialAuthenticatedModelListResponseState,
  displayedTemplate: null,
  loadingDetail: false
};

const initialState: Modules.Budget.Store = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  comments: {
    ...redux.initialState.initialAuthenticatedModelListResponseState,
    replying: []
  },
  history: redux.initialState.initialModelListResponseState,
  commentsHistoryDrawerOpen: false,
  account: initialAccountState,
  subaccount: initialSubAccountState,
  headerTemplates: initialHeaderTemplatesState,
  actuals: {
    ...redux.initialState.initialTableState,
    actualTypes: [],
    ownerTree: redux.initialState.initialAuthenticatedModelListResponseState
  }
};

export default initialState;
