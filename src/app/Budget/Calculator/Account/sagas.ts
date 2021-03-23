import { isNil } from "lodash";
import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "../actions";
import {
  getAccountTask,
  getAccountSubAccountsTask,
  handleAccountSubAccountUpdateTask,
  handleAccountSubAccountRemovalTask,
  handleAccountChangedTask,
  getAccountCommentsTask,
  submitAccountCommentTask,
  deleteAccountCommentTask,
  editAccountCommentTask,
  getAccountSubAccountsHistoryTask,
  deleteAccountSubAccountGroupTask
} from "./tasks";

function* watchForRequestSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SubAccountsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountSubAccountsTask, action);
  }
}

function* watchForRemoveSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccounts.Remove, handleAccountSubAccountRemovalTask);
}

function* watchForUpdateSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccounts.Update, handleAccountSubAccountUpdateTask);
}

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountTask, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleAccountChangedTask, action);
  }
}

function* watchForRequestCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountCommentsTask, action);
  }
}

function* watchForSubmitCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Comments.Submit);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitAccountCommentTask, action);
  }
}

function* watchForRemoveCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.Comments.Delete, deleteAccountCommentTask);
}

function* watchForEditCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.Comments.Edit, editAccountCommentTask);
}

function* watchForRequestSubAccountsHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SubAccounts.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountSubAccountsHistoryTask, action);
  }
}

function* watchForDeleteSubAccountGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action = yield take(ActionType.Account.SubAccounts.Groups.Delete);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      // If there were any previously submitted tasks to delete the same group,
      // cancel them.
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
    }
    lastTasks[action.payload].push(yield call(deleteAccountSubAccountGroupTask, action));
  }
}

export default function* accountSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(watchForRequestSubAccountsHistorySaga);
  yield spawn(watchForRequestAccountSaga);
  yield spawn(watchForRequestSubAccountsSaga);
  yield spawn(watchForRemoveSubAccountSaga);
  yield spawn(watchForUpdateSubAccountSaga);
  yield spawn(watchForRequestCommentsSaga);
  yield spawn(watchForSubmitCommentSaga);
  yield spawn(watchForRemoveCommentSaga);
  yield spawn(watchForEditCommentSaga);
  yield spawn(watchForDeleteSubAccountGroupSaga);
}
