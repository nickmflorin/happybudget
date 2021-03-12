import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "./actions";
import {
  getAccountTask,
  getSubAccountTask,
  getAccountsTask,
  getAccountSubAccountsTask,
  getSubAccountSubAccountsTask,
  handleAccountUpdateTask,
  handleAccountSubAccountUpdateTask,
  handleAccountSubAccountRemovalTask,
  handleAccountRemovalTask,
  handleSubAccountSubAccountUpdateTask,
  handleSubAccountSubAccountRemovalTask,
  handleAccountChangedTask,
  handleSubAccountChangedTask,
  getBudgetCommentsTask,
  getAccountCommentsTask,
  getSubAccountCommentsTask,
  submitBudgetCommentTask
} from "./tasks";

function* watchForTriggerBudgetAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.AccountsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountsTask, action);
  }
}

function* watchForTriggerAccountSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SubAccountsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountSubAccountsTask, action);
  }
}

function* watchForTriggerSubAccountSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.SubAccountsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountSubAccountsTask, action);
  }
}

function* watchForRemoveAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Accounts.Remove, handleAccountRemovalTask);
}

function* watchForRemoveSubAccountSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.SubAccounts.Remove, handleSubAccountSubAccountRemovalTask);
}

function* watchForRemoveAccountSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccounts.Remove, handleAccountSubAccountRemovalTask);
}

function* watchForAccountUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Accounts.Update, handleAccountUpdateTask);
}

function* watchForUpdateAccountSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccounts.Update, handleAccountSubAccountUpdateTask);
}

function* watchForUpdateSubAccountSubAccountwSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.SubAccounts.Update, handleSubAccountSubAccountUpdateTask);
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

function* watchForTriggerAccountCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountCommentsTask, action);
  }
}

function* watchForTriggerSubAccountCommentsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.Comments.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountCommentsTask, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(watchForRequestAccountSaga);
  yield spawn(watchForRequestSubAccountSaga);
  yield spawn(watchForTriggerBudgetAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
  yield spawn(watchForTriggerAccountSubAccountsSaga);
  yield spawn(watchForUpdateSubAccountSubAccountwSaga);
  yield spawn(watchForRemoveAccountSubAccountSaga);
  yield spawn(watchForTriggerSubAccountSubAccountsSaga);
  yield spawn(watchForUpdateAccountSubAccountSaga);
  yield spawn(watchForRemoveSubAccountSubAccountSaga);
  yield spawn(watchForTriggerBudgetCommentsSaga);
  yield spawn(watchForTriggerAccountCommentsSaga);
  yield spawn(watchForTriggerSubAccountCommentsSaga);
  yield spawn(watchForSubmitBudgetCommentSaga);
}
