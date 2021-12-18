import * as api from "api";
import { budgeting, tabling } from "lib";

import { accounts as actions, loadingBudgetAction, updateBudgetInStateAction } from "../actions";

const ActionMap: Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Budget>>;
} = {
  request: actions.requestAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.AccountRowData, Model.Account>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.AccountRowData,
    Model.Account,
    Tables.AccountTableContext,
    Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Tables.AccountTableContext>
  >({
    actions: ActionMap,
    tasks: budgeting.tasks.accounts.createTableTaskSet<Model.Budget>({
      table,
      selectStore: (state: Application.AuthenticatedStore) => state.budget.accounts,
      actions: ActionMap,
      services: {
        create: api.createBudgetAccount,
        request: api.getBudgetAccounts,
        requestGroups: api.getBudgetAccountGroups,
        requestMarkups: api.getBudgetAccountMarkups,
        bulkCreate: api.bulkCreateBudgetAccounts,
        bulkDelete: api.bulkDeleteBudgetAccounts,
        bulkUpdate: api.bulkUpdateBudgetAccounts,
        bulkDeleteMarkups: api.bulkDeleteBudgetMarkups
      }
    })
  });
