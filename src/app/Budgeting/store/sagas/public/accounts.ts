import { tabling } from "lib";
import * as store from "store";

import { accounts as actions } from "../../actions/public";

const ActionMap: Redux.TableActionMap<Model.Account, Tables.AccountTableContext> = {
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createPublicTableSaga<Tables.AccountRowData, Model.Account, Tables.AccountTableStore, Tables.AccountTableContext>({
    actions: ActionMap,
		selectStore: (state: Application.Store) => state.public.budget.accounts,
    tasks: store.tasks.accounts.createPublicTableTaskSet<Model.Budget>({
      table,
      actions: ActionMap,
			selectStore: (state: Application.Store) => state.public.budget.accounts,
    })
  });
