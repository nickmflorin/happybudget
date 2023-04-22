import { model } from "lib";

import * as tabling from "../../../../deprecated/store/reducers/tabling";
import * as types from "../../types";

type R = model.AccountRow;
type M = model.Account;
type S = types.AccountTableStore;

export const createPublicAccountsTableReducer = <B extends model.Budget | model.Template>(
  config: types.TableReducerConfig<R, M, S, AccountsTableActionContext<B, true>>,
): types.Reducer<S, AccountsTableActionContext<B, true>> =>
  tabling.createPublicTableReducer<R, M, S, AccountsTableActionContext<B, true>>(config);

export const createAuthenticatedAccountsTableReducer = <B extends model.Budget | model.Template>(
  config: Omit<
    types.AuthenticatedTableReducerConfig<R, M, S, AccountsTableActionContext<B, false>>,
    "defaultDataOnCreate" | "getModelRowChildren"
  >,
): types.Reducer<S, AccountsTableActionContext<B, false>> =>
  tabling.createAuthenticatedTableReducer<R, M, S, AccountsTableActionContext<B, false>>({
    getModelRowChildren: (m: model.Account) => m.children,
    defaultDataOnCreate: {
      markup_contribution: 0.0,
      actual: 0.0,
      accumulated_markup_contribution: 0.0,
      accumulated_fringe_contribution: 0.0,
    },
    ...config,
  });
