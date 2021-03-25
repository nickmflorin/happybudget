import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "./actions";
import {
  getAccountsTask,
  handleAccountUpdateTask,
  handleAccountRemovalTask,
  getCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editCommentTask,
  getHistoryTask
} from "./tasks";

function* watchForRequestAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Accounts.Request);
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

function* watchForTriggerCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getCommentsTask, action);
  }
}

function* watchForSubmitCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Comments.Submit);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitCommentTask, action);
  }
}

function* watchForRemoveCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Delete, deleteCommentTask);
}

function* watchForEditCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Edit, editCommentTask);
}

function* watchForTriggerAccountsHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Accounts.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getHistoryTask, action);
  }
}

export default function* accountsSaga(): SagaIterator {
  yield spawn(watchForRequestAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
  yield spawn(watchForTriggerCommentsSaga);
  yield spawn(watchForSubmitCommentSaga);
  yield spawn(watchForRemoveCommentSaga);
  yield spawn(watchForEditCommentSaga);
  yield spawn(watchForTriggerAccountsHistorySaga);
}
