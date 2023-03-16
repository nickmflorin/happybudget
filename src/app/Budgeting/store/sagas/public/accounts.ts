import { tabling } from "lib";
import * as store from "store";

import * as actions from "../../actions/public";

type R = Tables.AccountRowData;
type M = Model.Account;
type B = Model.Budget;
type C = AccountsTableActionContext<B, true>;

const ActionMap = {
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
};

export const createTableSaga = (table: Table.TableInstance<R, M>) =>
  tabling.sagas.createPublicTableSaga<R, M, Tables.AccountTableStore, C>({
    actions: ActionMap,
    selectStore: (state: Application.Store) => state.public.budget.accounts,
    tasks: store.tasks.accounts.createPublicTableTaskSet<B>({
      table,
      actions: ActionMap,
      selectStore: (state: Application.Store) => state.public.budget.accounts,
    }),
  });
