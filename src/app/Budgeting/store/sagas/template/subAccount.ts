import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery, fork } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "../../actions";
import {
  getSubAccountTask,
  getSubAccountsTask,
  handleSubAccountUpdateTask,
  handleSubAccountRemovalTask,
  handleSubAccountChangedTask,
  deleteSubAccountGroupTask,
  removeSubAccountFromGroupTask,
  getGroupsTask,
  handleSubAccountBulkUpdateTask
} from "../../tasks/template/subAccount";

function* watchForRequestSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.SubAccounts.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountsTask, action);
  }
}

function* watchForRequestGroupsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.SubAccounts.Groups.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getGroupsTask, action);
  }
}

function* watchForBulkUpdateSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.SubAccount.BulkUpdate, handleSubAccountBulkUpdateTask);
}

function* watchForRemoveSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.SubAccount.SubAccounts.Remove, handleSubAccountRemovalTask);
}

function* watchForUpdateSubAccountwSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.SubAccount.SubAccounts.Update, handleSubAccountUpdateTask);
}

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleSubAccountChangedTask, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountTask, action);
  }
}

function* watchForDeleteGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Template.SubAccount.SubAccounts.Groups.Delete);
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
      const task = yield fork(deleteSubAccountGroupTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

function* watchForRemoveSubAccountFromGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.Action<number> = yield take(ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup);
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
      const task = yield fork(removeSubAccountFromGroupTask, action);
      lastTasks[action.payload].push(task);
    }
  }
}

export default function* subAccountSaga(): SagaIterator {
  yield spawn(watchForRequestSubAccountsSaga);
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(watchForRemoveSubAccountSaga);
  yield spawn(watchForRequestSubAccountSaga);
  yield spawn(watchForUpdateSubAccountwSaga);
  yield spawn(watchForDeleteGroupSaga);
  yield spawn(watchForRemoveSubAccountFromGroupSaga);
  yield spawn(watchForRequestGroupsSaga);
  yield spawn(watchForBulkUpdateSubAccountSaga);
}
