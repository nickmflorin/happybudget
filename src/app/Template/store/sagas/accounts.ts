import { SagaIterator } from "redux-saga";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { spawn } from "redux-saga/effects";
import { filter, intersection } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

import { AccountsTable } from "tabling";

import { accounts as actions, loadingTemplateAction, updateTemplateInStateAction } from "../actions";

const ActionMap: Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account>> & {
  readonly request: ActionCreatorWithPayload<Redux.TableRequestPayload>;
  readonly loadingBudget: ActionCreatorWithPayload<boolean>;
  readonly updateBudgetInState: ActionCreatorWithPayload<Redux.UpdateActionPayload<Model.Template>>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingTemplateAction,
  updateBudgetInState: updateTemplateInStateAction,
  setSearch: actions.setSearchAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.AccountRowData,
  Model.Account,
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account> & {
    readonly request: Redux.TableRequestPayload;
  }
>({
  actions: ActionMap,
  tasks: budgeting.tasks.accounts.createTableTaskSet<Model.Template>({
    columns: filter(
      AccountsTable.Columns,
      (c: Table.Column<Tables.AccountRowData, Model.Account>) =>
        intersection([c.field, c.colId], ["variance", "actual"]).length === 0
    ),
    selectObjId: (state: Application.Authenticated.Store) => state.template.id,
    selectStore: (state: Application.Authenticated.Store) => state.template.accounts,
    actions: ActionMap,
    services: {
      create: api.createTemplateAccount,
      request: api.getTemplateAccounts,
      requestMarkups: api.getTemplateAccountMarkups,
      requestGroups: api.getTemplateAccountGroups,
      bulkCreate: api.bulkCreateTemplateAccounts,
      bulkDelete: api.bulkDeleteTemplateAccounts,
      bulkUpdate: api.bulkUpdateTemplateAccounts,
      bulkDeleteMarkups: api.bulkDeleteTemplateMarkups
    }
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(tableSaga);
}
