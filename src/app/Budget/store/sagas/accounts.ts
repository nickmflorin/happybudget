import { SagaIterator } from "redux-saga";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { put, select, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux, budgeting, tabling, notifications } from "lib";

import { AccountsTable } from "components/tabling";

import { accounts as actions, loadingBudgetAction, updateBudgetInStateAction } from "../actions";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
  if (!isNil(budgetId)) {
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield api.request(api.getAccountsHistory, budgetId, {});
      yield put(actions.responseHistoryAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the accounts history.");
    } finally {
      yield put(actions.loadingHistoryAction(false));
    }
  }
}

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const historySaga = redux.sagas.createModelListResponseSaga<Model.HistoryEvent>({
  tasks: { request: getHistoryTask },
  actions: {
    request: actions.requestHistoryAction
  }
});

const CommentsActionMap = {
  response: actions.responseCommentsAction,
  submit: actions.createCommentAction,
  edit: actions.updateCommentAction,
  request: actions.requestCommentsAction,
  delete: actions.deleteCommentAction,
  loading: actions.loadingCommentsAction,
  updating: actions.updatingCommentAction,
  deleting: actions.deletingCommentAction,
  creating: actions.creatingCommentAction,
  replying: actions.replyingToCommentAction,
  removeFromState: actions.removeCommentFromStateAction,
  updateInState: actions.updateCommentInStateAction,
  addToState: actions.addCommentToStateAction
};

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
const commentsSaga = budgeting.sagas.createCommentsListResponseSaga({
  tasks: budgeting.tasks.comments.createListResponseTaskSet({
    actions: CommentsActionMap
  }),
  actions: CommentsActionMap
});

const ActionMap: Redux.ActionMapObject<Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account>> & {
  readonly loadingBudget: ActionCreatorWithPayload<boolean>;
  readonly updateBudgetInState: ActionCreatorWithPayload<Redux.UpdateActionPayload<Model.Budget>>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  clear: actions.clearAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.AccountRowData,
  Model.Account,
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.accounts.createTableTaskSet<Model.Budget>({
    columns: AccountsTable.Columns,
    selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
    actions: ActionMap,
    services: {
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

export default function* rootSaga(): SagaIterator {
  yield spawn(tableSaga);
}
