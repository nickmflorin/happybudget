import axios from "axios";
import { SagaIterator } from "redux-saga";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { call, put, select, cancelled, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux, budgeting, tabling } from "lib";

import { AccountsTable } from "components/tabling";

import { accounts as actions, loadingBudgetAction, updateBudgetInStateAction } from "../actions";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getAccountsHistory,
        budgetId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseHistoryAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the accounts history.");
      }
    } finally {
      yield put(actions.loadingHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

const commentsSaga = budgeting.sagas.createCommentsListResponseSaga({
  tasks: budgeting.tasks.comments.createListResponseTaskSet({
    actions: CommentsActionMap
  }),
  actions: CommentsActionMap
});

const ActionMap: Redux.ActionMapObject<
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Model.BudgetGroup>
> & {
  readonly loadingBudget: ActionCreatorWithPayload<boolean>;
  readonly updateBudgetInState: ActionCreatorWithPayload<Redux.UpdateActionPayload<Model.Budget>>;
} = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
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
  Model.BudgetGroup,
  Redux.TableTaskMap<Tables.AccountRowData, Model.Account>,
  Redux.AuthenticatedTableActionMap<Tables.AccountRowData, Model.Account, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.accounts.createTableTaskSet<Model.Budget>({
    columns: AccountsTable.BudgetColumns,
    selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
    selectAutoIndex: (state: Application.Authenticated.Store) => state.budget.autoIndex,
    selectData: (state: Application.Authenticated.Store) =>
      !isNil(state["async-BudgetAccountsTable"]) ? state["async-BudgetAccountsTable"].data : [],
    actions: ActionMap,
    services: {
      request: api.getBudgetAccounts,
      requestGroups: api.getBudgetAccountGroups,
      bulkCreate: api.bulkCreateBudgetAccounts,
      bulkDelete: api.bulkDeleteBudgetAccounts,
      bulkUpdate: api.bulkUpdateBudgetAccounts
    }
  })
});

export default function* rootSaga(): SagaIterator {
  // yield spawn(historySaga);
  // yield spawn(commentsSaga);
  yield spawn(tableSaga);
}
