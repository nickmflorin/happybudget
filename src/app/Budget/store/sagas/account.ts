import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, spawn, takeLatest, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux, budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  account as actions,
  responseFringesAction,
  loadingBudgetAction,
  updateBudgetInStateAction,
  responseSubAccountUnitsAction,
  responseFringeColorsAction
} from "../actions";

function* getAccount(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Application.Authenticated.Store) => state.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const response: Model.Account = yield call(api.getAccount, accountId, { cancelToken: source.token });
      yield put(actions.responseAccountAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the account.");
        yield put(actions.responseAccountAction(null));
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Application.Authenticated.Store) => state.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getAccountSubAccountsHistory,
        accountId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseHistoryAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the account's sub accounts history.");
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

const ActionMap = {
  request: actions.requestAction,
  updateParentInState: actions.updateInStateAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  clear: actions.clearAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.Account, Model.Budget>({
  columns: SubAccountsTable.Columns,
  selectBudgetId: (state: Application.Authenticated.Store) => state.budget.id,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.account.id,
  actions: ActionMap,
  services: {
    request: api.getAccountSubAccounts,
    requestGroups: api.getAccountSubAccountGroups,
    requestMarkups: api.getAccountSubAccountMarkups,
    requestFringes: api.getBudgetFringes,
    bulkCreate: api.bulkCreateAccountSubAccounts,
    bulkDelete: api.bulkDeleteAccountSubAccounts,
    bulkUpdate: api.bulkUpdateAccountSubAccounts,
    bulkDeleteMarkups: api.bulkDeleteAccountMarkups
  }
});

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount>
>({
  actions: ActionMap,
  tasks: Tasks
});

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getAccount, action), call(Tasks.request, action)]);
}

export default function* rootSaga(): SagaIterator {
  yield takeLatest(actions.setAccountIdAction.toString(), getData);
  yield takeLatest(actions.requestAction.toString(), getData);
  yield takeLatest(actions.requestAccountAction.toString(), getAccount);
  yield spawn(tableSaga);
}
