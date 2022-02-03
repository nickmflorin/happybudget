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
  tabling.sagas.createPublicTableSaga<Model.Account, Tables.AccountTableContext>({
    actions: ActionMap,
    tasks: budgeting.tasks.accounts.createPublicTableTaskSet<Model.Budget>({
      table,
      actions: ActionMap
    })
  });
