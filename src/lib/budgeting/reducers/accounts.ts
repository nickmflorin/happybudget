import { tabling } from "lib";

import { createBudgetTableReducer } from "./base";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

/* eslint-disable indent */
export const createUnauthenticatedAccountsTableReducer = (
  config: Table.ReducerConfig<R, M, Model.BudgetGroup, S>
): Redux.Reducer<S> => {
  return createBudgetTableReducer<R, M, S>(config);
};

export const createAuthenticatedAccountsTableReducer = (
  config: Table.ReducerConfig<R, M, Model.BudgetGroup, S, Redux.AuthenticatedTableActionMap<R, M, Model.BudgetGroup>>
): Redux.Reducer<S> => tabling.reducers.createAuthenticatedTableReducer<R, M, Model.BudgetGroup, S>(config);
