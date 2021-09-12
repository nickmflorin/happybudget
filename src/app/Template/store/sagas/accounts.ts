import { SagaIterator } from "redux-saga";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

import { AccountsTable } from "components/tabling";

import { accounts as actions, loadingTemplateAction, updateTemplateInStateAction } from "../actions";

const ActionMap: Redux.ActionMapObject<
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Model.BudgetGroup>
> & {
  readonly loadingBudget: ActionCreatorWithPayload<boolean>;
  readonly updateBudgetInState: ActionCreatorWithPayload<Redux.UpdateActionPayload<Model.Template>>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  addPlaceholdersToState: actions.addPlaceholdersToState,
  loadingBudget: loadingTemplateAction,
  updateBudgetInState: updateTemplateInStateAction,
  setSearch: actions.setSearchAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.AccountRowData,
  Model.Account,
  Model.BudgetGroup,
  Redux.TableTaskMap<Tables.AccountRowData, Model.Account>,
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.accounts.createTableTaskSet<Model.Template>({
    columns: AccountsTable.TemplateColumns,
    selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
    selectAutoIndex: (state: Application.Authenticated.Store) => state.budget.autoIndex,
    selectData: (state: Application.Authenticated.Store) =>
      !isNil(state["async-TemplateAccountsTable"]) ? state["async-TemplateAccountsTable"].data : [],
    actions: ActionMap,
    services: {
      request: api.getTemplateAccounts,
      requestGroups: api.getTemplateAccountGroups,
      bulkCreate: api.bulkCreateTemplateAccounts,
      bulkDelete: api.bulkDeleteTemplateAccounts,
      bulkUpdate: api.bulkUpdateTemplateAccounts
    }
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(tableSaga);
}
