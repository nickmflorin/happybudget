import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "../actions";
import {
  getAccountsTask,
  handleAccountUpdateTask,
  handleAccountRemovalTask,
  getCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editCommentTask,
  getHistoryTask,
  deleteAccountGroupTask,
  removeAccountFromGroupTask,
  getGroupsTask,
  handleAccountsBulkUpdateTask
} from "../tasks/accounts";

function* watchForRequestAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Accounts.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountsTask, action);
  }
}

function* watchForRequestGroupsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Accounts.Groups.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getGroupsTask, action);
  }
}

function* watchForBulkUpdateAccountsSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.BulkUpdateAccounts, handleAccountsBulkUpdateTask);
}

function* watchForRemoveAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Accounts.Remove, handleAccountRemovalTask);
}

function* watchForAccountUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Accounts.Update, handleAccountUpdateTask);
}

function* watchForRequestCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getCommentsTask, action);
  }
}

function* watchForSubmitCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Comments.Create);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitCommentTask, action);
  }
}

function* watchForRemoveCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Comments.Delete, deleteCommentTask);
}

function* watchForEditCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Comments.Update, editCommentTask);
}

function* watchForRequestHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Accounts.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getHistoryTask, action);
  }
}

function* watchForDeleteGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<number> = yield take(ActionType.Budget.Accounts.Groups.Delete);
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
      lastTasks[action.payload].push(yield call(deleteAccountGroupTask, action));
    }
  }
}

function* watchForRemoveAccountFromGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<number> = yield take(ActionType.Budget.Accounts.RemoveFromGroup);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      // If there were any previously submitted tasks to remove the same row,
      // cancel them.
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload].push(yield call(removeAccountFromGroupTask, action));
    }
  }
}

export default function* accountsSaga(): SagaIterator {
  yield spawn(watchForRequestAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
  yield spawn(watchForRequestCommentsSaga);
  yield spawn(watchForSubmitCommentSaga);
  yield spawn(watchForRemoveCommentSaga);
  yield spawn(watchForEditCommentSaga);
  yield spawn(watchForRequestHistorySaga);
  yield spawn(watchForDeleteGroupSaga);
  yield spawn(watchForRemoveAccountFromGroupSaga);
  yield spawn(watchForRequestGroupsSaga);
  yield spawn(watchForBulkUpdateAccountsSaga);
}
