import { budgeting, tabling } from "lib";

import { accounts as actions, loadingBudgetAction } from "../../actions/public";

const ActionMap: Redux.TableActionMap<Model.Account, Tables.AccountTableContext> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
} = {
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  loadingBudget: loadingBudgetAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createPublicTableSaga<Tables.AccountRowData, Model.Account, Tables.AccountTableStore, Tables.AccountTableContext>({
    actions: ActionMap,
		selectStore: (state: Application.Store) => state.public.budget.accounts,
    tasks: budgeting.tasks.accounts.createPublicTableTaskSet<Model.Budget>({
      table,
      actions: ActionMap,
			selectStore: (state: Application.Store) => state.public.budget.accounts,
    })
  });
