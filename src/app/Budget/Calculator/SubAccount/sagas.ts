import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "./actions";
import {
  getSubAccountTask,
  getSubAccountsTask,
  handleSubAccountUpdateTask,
  handleSubAccountRemovalTask,
  handleSubAccountChangedTask,
  getCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editCommentTask,
  getSubAccountsHistoryTask
} from "./tasks";

function* watchForRequestSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccounts.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountsTask, action);
  }
}

function* watchForRemoveSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccounts.Remove, handleSubAccountRemovalTask);
}

function* watchForUpdateSubAccountwSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccounts.Update, handleSubAccountUpdateTask);
}

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleSubAccountChangedTask, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountTask, action);
  }
}

function* watchForRequestSubAccountCommentsSaga(): SagaIterator {
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

function* watchForRequestSubAccountsHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccounts.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountsHistoryTask, action);
  }
}

export default function* subAccountSaga(): SagaIterator {
  yield spawn(watchForRequestSubAccountsSaga);
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(watchForRemoveSubAccountSaga);
  yield spawn(watchForRequestSubAccountSaga);
  yield spawn(watchForUpdateSubAccountwSaga);
  yield spawn(watchForRequestSubAccountCommentsSaga);
  yield spawn(watchForSubmitCommentSaga);
  yield spawn(watchForRemoveCommentSaga);
  yield spawn(watchForEditCommentSaga);
  yield spawn(watchForRequestSubAccountsHistorySaga);
}
