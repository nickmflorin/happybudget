import { tabling } from "lib";
import * as store from "store";

import * as actions from "../../actions/budget";

type R = Tables.AccountRowData;
type M = Model.Account;
type B = Model.Budget;
type C = AccountsTableActionContext<B, false>;

const ActionMap = {
  request: actions.requestAction,
  handleEvent: actions.handleTableEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<R, M>) =>
  tabling.sagas.createAuthenticatedTableSaga<R, M, Tables.AccountTableStore, C>({
    actions: ActionMap,
    selectStore: (state: Application.Store) => state.budget.accounts,
    tasks: store.tasks.accounts.createAuthenticatedTableTaskSet<B>({
      table,
      selectStore: (state: Application.Store) => state.budget.accounts,
      actions: { ...ActionMap, updateBudgetInState: actions.updateBudgetInStateAction }
    })
  });
