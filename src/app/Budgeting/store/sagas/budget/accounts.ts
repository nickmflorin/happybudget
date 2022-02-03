import { budgeting, tabling } from "lib";

import { accounts as actions, loadingBudgetAction, updateBudgetInStateAction } from "../../actions/budget";

const ActionMap: Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Budget>>;
} = {
  request: actions.requestAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createAuthenticatedTableSaga<Tables.AccountRowData, Model.Account, Tables.AccountTableContext>({
    actions: ActionMap,
    tasks: budgeting.tasks.accounts.createAuthenticatedTableTaskSet<Model.Budget>({
      table,
      selectStore: (state: Application.Store) => state.budget.accounts,
      actions: ActionMap
    })
  });
