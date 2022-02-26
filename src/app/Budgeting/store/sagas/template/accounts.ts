import { budgeting, tabling } from "lib";

import { accounts as actions, loadingBudgetAction, updateBudgetInStateAction } from "../../actions/template";

const ActionMap: Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Template>>;
} = {
  request: actions.requestAction,
  tableChanged: actions.handleTableEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createAuthenticatedTableSaga<Tables.AccountRowData, Model.Account, Tables.AccountTableContext>({
    actions: ActionMap,
    tasks: budgeting.tasks.accounts.createAuthenticatedTableTaskSet<Model.Template>({
      table,
      selectStore: (state: Application.Store) => state.template.accounts,
      actions: ActionMap
    })
  });
