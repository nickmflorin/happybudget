import { createBudgetTableReducer, createAuthenticatedBudgetTableReducer } from "./base";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

type ReducerConfig<A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>> = Table.ReducerConfig<R, M, S, A>;

/* eslint-disable indent */
export const createUnauthenticatedAccountsTableReducer = (config: ReducerConfig): Redux.Reducer<S> => {
  return createBudgetTableReducer<R, M, S>(config);
};

export const createAuthenticatedAccountsTableReducer = (
  config: ReducerConfig<Redux.AuthenticatedTableActionMap<R, M>>
): Redux.Reducer<S> =>
  createAuthenticatedBudgetTableReducer<R, M, S>({
    ...config
  });
