import { tabling } from "lib";
import * as store from "store";

import { accounts as actions, updateBudgetInStateAction } from "../../actions/budget";

const ActionMap: Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext> & {
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<Model.Budget>>;
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
    selectStore: (state: Application.Store) => state.budget.accounts,
    tasks: store.tasks.accounts.createAuthenticatedTableTaskSet<Model.Budget>({
      table,
      selectStore: (state: Application.Store) => state.budget.accounts,
      actions: ActionMap
    })
  });
