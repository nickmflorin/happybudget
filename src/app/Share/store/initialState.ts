import { redux } from "lib";

export const initialBudgetState: Modules.Unauthenticated.Share.BudgetStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialReadOnlyBudgetTableState
};

export const initialSubAccountState: Modules.Unauthenticated.Share.SubAccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialReadOnlyBudgetTableWithFringesState
};

export const initialAccountState: Modules.Unauthenticated.Share.AccountStore = {
  id: null,
  detail: redux.initialState.initialDetailResponseState,
  table: redux.initialState.initialReadOnlyBudgetTableWithFringesState
};

const initialState: Modules.Unauthenticated.Share.StoreObj = {
  budget: initialBudgetState,
  account: initialAccountState,
  subaccount: initialSubAccountState
};

export default initialState;
