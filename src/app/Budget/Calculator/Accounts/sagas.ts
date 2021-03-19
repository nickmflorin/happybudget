import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "../actions";
import {
  getAccountsTask,
  handleAccountUpdateTask,
  handleAccountRemovalTask,
  getBudgetCommentsTask,
  submitBudgetCommentTask,
  deleteBudgetCommentTask,
  editBudgetCommentTask,
  getAccountsHistoryTask
} from "./tasks";

function* watchForRequestAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.AccountsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountsTask, action);
  }
}

function* watchForRemoveAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Accounts.Remove, handleAccountRemovalTask);
}

function* watchForAccountUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Accounts.Update, handleAccountUpdateTask);
}

function* watchForTriggerBudgetCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetCommentsTask, action);
  }
}

function* watchForSubmitBudgetCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Comments.Submit);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitBudgetCommentTask, action);
  }
}

function* watchForRemoveBudgetCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Delete, deleteBudgetCommentTask);
}

function* watchForEditBudgetCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Edit, editBudgetCommentTask);
}

function* watchForTriggerAccountsHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountsHistoryTask, action);
  }
}

export default function* accountsSaga(): SagaIterator {
  yield spawn(watchForRequestAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
  yield spawn(watchForTriggerBudgetCommentsSaga);
  yield spawn(watchForSubmitBudgetCommentSaga);
  yield spawn(watchForRemoveBudgetCommentSaga);
  yield spawn(watchForEditBudgetCommentSaga);
  yield spawn(watchForTriggerAccountsHistorySaga);
}
