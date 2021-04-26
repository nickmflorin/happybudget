import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery, fork } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "../../actions";
import {
  getAccountsTask,
  handleAccountUpdateTask,
  handleAccountRemovalTask,
  deleteAccountGroupTask,
  removeAccountFromGroupTask,
  getGroupsTask,
  handleAccountsBulkUpdateTask
} from "../../tasks/template/accounts";

function* watchForRequestAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Accounts.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountsTask, action);
  }
}

function* watchForRequestGroupsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Accounts.Groups.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getGroupsTask, action);
  }
}

function* watchForBulkUpdateAccountsSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.BulkUpdateAccounts, handleAccountsBulkUpdateTask);
}

function* watchForRemoveAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Accounts.Remove, handleAccountRemovalTask);
}

function* watchForAccountUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Accounts.Update, handleAccountUpdateTask);
}

function* watchForDeleteGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Template.Accounts.Groups.Delete);
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
      const task = yield fork(deleteAccountGroupTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForRemoveAccountFromGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Template.Accounts.RemoveFromGroup);
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
      const task = yield fork(removeAccountFromGroupTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

export default function* accountsSaga(): SagaIterator {
  yield spawn(watchForRequestAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
  yield spawn(watchForDeleteGroupSaga);
  yield spawn(watchForRemoveAccountFromGroupSaga);
  yield spawn(watchForRequestGroupsSaga);
  yield spawn(watchForBulkUpdateAccountsSaga);
}
