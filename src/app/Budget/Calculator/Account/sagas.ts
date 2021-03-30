import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import {
  getAccountTask,
  getSubAccountsTask,
  handleSubAccountUpdateTask,
  handleSubAccountRemovalTask,
  handleAccountChangedTask,
  getAccountCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editAccountCommentTask,
  getHistoryTask,
  deleteSubAccountGroupTask,
  removeSubAccountFromGroupTask,
  handleSubAccountPlaceholderActivatedTask,
  getGroupsTask
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

function* watchForRequestGroupsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccounts.Groups.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getGroupsTask, action);
  }
}

function* watchForRemoveSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccounts.Remove, handleSubAccountRemovalTask);
}

function* watchForUpdateSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccounts.Update, handleSubAccountUpdateTask);
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
    const action = yield take(ActionType.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountCommentsTask, action);
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
  yield takeEvery(ActionType.Comments.Edit, editAccountCommentTask);
}

function* watchForRequestHistorySaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccounts.History.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getHistoryTask, action);
  }
}

function* watchForSubAccountActivatedInStateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<Table.ActivatePlaceholderPayload<ISubAccount>> = yield take(
      ActionType.SubAccounts.Placeholders.Activate
    );
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload.model.id])) {
        lastTasks[action.payload.model.id] = [];
      }
      if (lastTasks[action.payload.model.id].length !== 0) {
        const cancellable = lastTasks[action.payload.model.id];
        lastTasks = { ...lastTasks, [action.payload.model.id]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload.model.id].push(yield call(handleSubAccountPlaceholderActivatedTask, action));
    }
  }
}

function* watchForDeleteGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<number> = yield take(ActionType.SubAccounts.Groups.Delete);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload].push(yield call(deleteSubAccountGroupTask, action));
    }
  }
}

function* watchForRemoveSubAccountFromGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<number> = yield take(ActionType.SubAccounts.RemoveFromGroup);
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload])) {
        lastTasks[action.payload] = [];
      }
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload].push(yield call(removeSubAccountFromGroupTask, action));
    }
  }
}

export default function* accountSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(watchForRequestHistorySaga);
  yield spawn(watchForRequestAccountSaga);
  yield spawn(watchForRequestSubAccountsSaga);
  yield spawn(watchForRemoveSubAccountSaga);
  yield spawn(watchForUpdateSubAccountSaga);
  yield spawn(watchForRequestCommentsSaga);
  yield spawn(watchForSubmitCommentSaga);
  yield spawn(watchForRemoveCommentSaga);
  yield spawn(watchForEditCommentSaga);
  yield spawn(watchForDeleteGroupSaga);
  yield spawn(watchForRemoveSubAccountFromGroupSaga);
  yield spawn(watchForSubAccountActivatedInStateSaga);
  yield spawn(watchForRequestGroupsSaga);
}
