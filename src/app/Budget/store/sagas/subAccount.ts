import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, spawn, all, takeLatest } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { redux, budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  subAccount as actions,
  loadingBudgetAction,
  updateBudgetInStateAction,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../actions";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Application.Authenticated.Store) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        api.getSubAccountSubAccountsHistory,
        subaccountId,
        {},
        { cancelToken: source.token }
      );
      yield put(actions.responseHistoryAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the sub account's sub accounts history.");
      }
    } finally {
      yield put(actions.loadingHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* getSubAccount(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Application.Authenticated.Store) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const response: Model.SubAccount = yield call(api.getSubAccount, subaccountId, { cancelToken: source.token });
      yield put(actions.responseSubAccountAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the sub account.");
        yield put(actions.responseSubAccountAction(null));
      }
    } finally {
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
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  clear: actions.clearAction,
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

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.SubAccount, Model.Budget>({
  columns: SubAccountsTable.Columns,
  selectBudgetId: (state: Application.Authenticated.Store) => state.budget.id,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.subaccount.id,
  selectAutoIndex: (state: Application.Authenticated.Store) => state.budget.autoIndex,
  selectData: (state: Application.Authenticated.Store) => state.budget.subaccount.table.data,
  actions: ActionMap,
  services: {
    request: api.getSubAccountSubAccounts,
    requestGroups: api.getSubAccountSubAccountGroups,
    requestFringes: api.getBudgetFringes,
    bulkCreate: api.bulkCreateSubAccountSubAccounts,
    bulkDelete: api.bulkDeleteSubAccountSubAccounts,
    bulkUpdate: api.bulkUpdateSubAccountSubAccounts
  }
});

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Model.BudgetGroup,
  Redux.TableTaskMapWithGroups<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: Tasks
});

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getSubAccount, action), call(Tasks.request, action)]);
}

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  yield takeLatest(actions.setSubAccountIdAction.toString(), getData);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(tableSaga);
}