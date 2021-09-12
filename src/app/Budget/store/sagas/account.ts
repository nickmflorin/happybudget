import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux, budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  ActionType,
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
        yield put(actions.responseAccountAction(undefined));
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

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccount, action);
  }
}

const ActionMap = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Model.BudgetGroup,
  Redux.TableTaskMapWithGroups<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.subaccounts.createTableTaskSet<Model.Account, Model.Budget>({
    columns: SubAccountsTable.AuthenticatedBudgetColumns,
    selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
    selectData: (state: Application.Authenticated.Store) => state.budget.account.table.data,
    selectAutoIndex: (state: Application.Authenticated.Store) => state.budget.autoIndex,
    actions: ActionMap,
    services: {
      request: api.getAccountSubAccounts,
      requestGroups: api.getAccountSubAccountGroups,
      requestFringes: api.getBudgetFringes,
      bulkCreate: api.bulkCreateAccountSubAccounts,
      bulkDelete: api.bulkDeleteAccountSubAccounts,
      bulkUpdate: api.bulkUpdateAccountSubAccounts
    }
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(watchForRequestAccountSaga);
  // yield spawn(historySaga);
  // yield spawn(commentsSaga);
  yield spawn(tableSaga);
}
