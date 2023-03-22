import { tabling } from "lib";

type R = Tables.AccountRowData;
type M = Model.Account;
type S = Tables.AccountTableStore;

export const createPublicAccountsTableReducer = <B extends Model.Budget | Model.Template>(
  config: Table.ReducerConfig<R, M, S, AccountsTableActionContext<B, true>>,
): Redux.Reducer<S, AccountsTableActionContext<B, true>> =>
  tabling.reducers.createPublicTableReducer<R, M, S, AccountsTableActionContext<B, true>>(config);

export const createAuthenticatedAccountsTableReducer = <B extends Model.Budget | Model.Template>(
  config: Omit<
    Table.AuthenticatedReducerConfig<R, M, S, AccountsTableActionContext<B, false>>,
    "defaultDataOnCreate" | "getModelRowChildren"
  >,
): Redux.Reducer<S, AccountsTableActionContext<B, false>> =>
  tabling.reducers.createAuthenticatedTableReducer<R, M, S, AccountsTableActionContext<B, false>>({
    getModelRowChildren: (m: Model.Account) => m.children,
    defaultDataOnCreate: {
      markup_contribution: 0.0,
      actual: 0.0,
      accumulated_markup_contribution: 0.0,
      accumulated_fringe_contribution: 0.0,
    },
    ...config,
  });
