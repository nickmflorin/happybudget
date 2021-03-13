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
  submitBudgetCommentTask,
  submitAccountCommentTask,
  submitSubAccountCommentTask,
  deleteBudgetCommentTask,
  deleteAccountCommentTask,
  deleteSubAccountCommentTask,
  editBudgetCommentTask,
  editAccountCommentTask,
  editSubAccountCommentTask,
  replyToAccountCommentTask,
  replyToBudgetCommentTask,
  replyToSubAccountCommentTask
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

function* watchForRemoveBudgetCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Delete, deleteBudgetCommentTask);
}

function* watchForEditBudgetCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Edit, editBudgetCommentTask);
}

function* watchForReplyToBudgetCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Comments.Reply, replyToBudgetCommentTask);
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

function* watchForSubmitAccountCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Comments.Submit);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitAccountCommentTask, action);
  }
}

function* watchForRemoveAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.Comments.Delete, deleteAccountCommentTask);
}

function* watchForEditAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.Comments.Edit, editAccountCommentTask);
}

function* watchForReplyToAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.Comments.Reply, replyToAccountCommentTask);
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

function* watchForSubmitSubAccountCommentSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.Comments.Submit);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(submitSubAccountCommentTask, action);
  }
}

function* watchForRemoveSubAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.Comments.Delete, deleteSubAccountCommentTask);
}

function* watchForEditSubAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.Comments.Edit, editSubAccountCommentTask);
}

function* watchForReplyToSubAccountCommentSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.Comments.Reply, replyToSubAccountCommentTask);
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
  yield spawn(watchForSubmitAccountCommentSaga);
  yield spawn(watchForSubmitSubAccountCommentSaga);
  yield spawn(watchForRemoveBudgetCommentSaga);
  yield spawn(watchForRemoveAccountCommentSaga);
  yield spawn(watchForRemoveSubAccountCommentSaga);
  yield spawn(watchForEditBudgetCommentSaga);
  yield spawn(watchForEditAccountCommentSaga);
  yield spawn(watchForEditSubAccountCommentSaga);
  yield spawn(watchForReplyToBudgetCommentSaga);
  yield spawn(watchForReplyToAccountCommentSaga);
  yield spawn(watchForReplyToSubAccountCommentSaga);
}
