import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
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
  getSubAccountsHistoryTask,
  deleteSubAccountGroupTask,
  removeSubAccountFromGroupTask,
  handleSubAccountPlaceholderActivatedTask,
  handleSubAccountUpdatedInStateTask,
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

function* watchForSubAccountAddedToStateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<Table.ActivatePlaceholderPayload<ISubAccount>> = yield take(
      ActionType.SubAccounts.Placeholders.Activate
    );
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload.model.id])) {
        lastTasks[action.payload.model.id] = [];
      }
      // If there were any previously submitted tasks to add the same group,
      // cancel them.
      if (lastTasks[action.payload.model.id].length !== 0) {
        const cancellable = lastTasks[action.payload.model.id];
        lastTasks = { ...lastTasks, [action.payload.model.id]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload.model.id].push(yield call(handleSubAccountPlaceholderActivatedTask, action));
    }
  }
}

function* watchForSubAccountUpdatedInStateSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccounts.UpdateInState, handleSubAccountUpdatedInStateTask);
}

function* watchForDeleteGroupSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<number> = yield take(ActionType.SubAccounts.Groups.Delete);
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
      // If there were any previously submitted tasks to remove the same row,
      // cancel them.
      if (lastTasks[action.payload].length !== 0) {
        const cancellable = lastTasks[action.payload];
        lastTasks = { ...lastTasks, [action.payload]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload].push(yield call(removeSubAccountFromGroupTask, action));
    }
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
  yield spawn(watchForDeleteGroupSaga);
  yield spawn(watchForRemoveSubAccountFromGroupSaga);
  yield spawn(watchForSubAccountAddedToStateSaga);
  yield spawn(watchForSubAccountUpdatedInStateSaga);
  yield spawn(watchForRequestGroupsSaga);
}
