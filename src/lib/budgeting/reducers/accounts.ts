import { createBudgetTableReducer } from "./base";

/* eslint-disable indent */
export const createUnauthenticatedAccountsTableReducer = (
  config: Redux.TableReducerConfig<Tables.AccountRowData, Model.Account, Model.BudgetGroup, Tables.AccountTableStore>
): Redux.Reducer<Tables.AccountTableStore> => {
  return createBudgetTableReducer<Tables.AccountRowData, Model.Account, Tables.AccountTableStore>(config);
};

export const createAuthenticatedAccountsTableReducer = (
  config: Redux.TableReducerConfig<Tables.AccountRowData, Model.Account, Model.BudgetGroup, Tables.AccountTableStore>
): Redux.Reducer<Tables.AccountTableStore> => {
  return createBudgetTableReducer<Tables.AccountRowData, Model.Account, Tables.AccountTableStore>(config);
};
