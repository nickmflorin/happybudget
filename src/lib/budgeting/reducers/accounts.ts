import * as tabling from "../../tabling";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;
type ACTION = Redux.TableAction<Redux.ActionPayload, Tables.ActualTableContext>;
type AM = Redux.AuthenticatedTableActionMap<R, M, Tables.AccountTableContext>;

type ReducerConfig<
  A extends Redux.TableActionMap<M, Tables.AccountTableContext> = Redux.TableActionMap<M, Tables.ActualTableContext>
> = Table.ReducerConfig<R, M, S, Tables.AccountTableContext, A>;

export const createPublicAccountsTableReducer = (config: ReducerConfig): Redux.Reducer<S, ACTION> => {
  return tabling.reducers.createPublicTableReducer<R, M, S, Tables.AccountTableContext>(config);
};

export const createAuthenticatedAccountsTableReducer = (
  config: Omit<ReducerConfig<AM>, "defaultDataOnCreate">
): Redux.Reducer<S, ACTION> =>
  tabling.reducers.createAuthenticatedTableReducer<R, M, S, Tables.AccountTableContext, AM, ACTION>({
    defaultDataOnCreate: {
      markup_contribution: 0.0,
      actual: 0.0,
      accumulated_markup_contribution: 0.0,
      accumulated_fringe_contribution: 0.0
    },
    ...config
  });
