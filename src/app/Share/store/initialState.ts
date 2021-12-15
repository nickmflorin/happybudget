import { redux } from "lib";

export const initialSubAccountState: Modules.Share.SubAccountStore = {
  detail: redux.initialState.initialDetailResponseState,
  table: {
    ...redux.initialState.initialTableState,
    fringes: {
      ...redux.initialState.initialTableState,
      fringeColors: []
    },
    subaccountUnits: []
  }
};

export const initialAccountState: Modules.Share.AccountStore = {
  detail: redux.initialState.initialDetailResponseState,
  table: {
    ...redux.initialState.initialTableState,
    fringes: {
      ...redux.initialState.initialTableState,
      fringeColors: []
    },
    subaccountUnits: []
  }
};

const initialState: Modules.Share.Store = {
  detail: redux.initialState.initialDetailResponseState,
  account: initialAccountState,
  subaccount: initialSubAccountState
};

export default initialState;
