import { budgeting, tabling } from "lib";

import { accounts as actions, updateBudgetInStateAction } from "../../actions/template";

const ActionMap: Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext> & {
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<Model.Template>>;
} = {
  request: actions.requestAction,
  handleEvent: actions.handleTableEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.AccountRowData,
    Model.Account,
    Tables.AccountTableStore,
    Tables.AccountTableContext
  >({
    actions: ActionMap,
    selectStore: (state: Application.Store) => state.template.accounts,
    tasks: budgeting.tasks.accounts.createAuthenticatedTableTaskSet<Model.Template>({
      table,
      selectStore: (state: Application.Store) => state.template.accounts,
      actions: ActionMap
    })
  });
