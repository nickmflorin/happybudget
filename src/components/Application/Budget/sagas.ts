import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import {
  getAccountsTask,
  getAccountSubAccountsTask,
  deleteAccountTask,
  removeAccountFromStateTask,
  updateAccountTask,
  updateAccountInStateTask,
  createAccountTask,
  addAccountToStateTask,
  deleteSubAccountTask,
  updateSubAccountTask,
  removeSubAccountFromStateTask,
  updateSubAccountInStateTask,
  addSubAccountToStateTask
} from "./tasks";

function* watchForTriggerBudgetAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Accounts.Request);
    if (!isNil(action.budgetId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getAccountsTask, action);
    }
  }
}

function* watchForTriggerAccountSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SubAccounts.Request);
    if (!isNil(action.budgetId) && !isNil(action.accountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getAccountSubAccountsTask, action);
    }
  }
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to delete the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being deleted
// however.
function* watchForDeleteAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.DeleteAccount, deleteAccountTask);
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to update the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being updated
// however.
function* watchForUpdateAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.UpdateAccount, updateAccountTask);
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to create the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being created
// however.
function* watchForCreateAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.CreateAccount, createAccountTask);
}

function* watchForAccountRemovedSaga(): SagaIterator {
  yield takeEvery(ActionType.AccountRemoved, removeAccountFromStateTask);
}

function* watchForAccountChangedSaga(): SagaIterator {
  yield takeEvery(ActionType.AccountChanged, updateAccountInStateTask);
}

function* watchForAccountAddedSaga(): SagaIterator {
  yield takeEvery(ActionType.AccountAdded, addAccountToStateTask);
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to delete the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being deleted
// however.
function* watchForDeleteSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.DeleteSubAccount, deleteSubAccountTask);
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to update the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being updated
// however.
function* watchForUpdateSubAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.UpdateSubAccount, updateSubAccountTask);
}

function* watchForSubAccountRemovedSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccountRemoved, removeSubAccountFromStateTask);
}

function* watchForSubAccountChangedSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccountChanged, updateSubAccountInStateTask);
}

function* watchForSubAccountAddedSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccountAdded, addSubAccountToStateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetAccountsSaga);
  yield spawn(watchForTriggerAccountSubAccountsSaga);
  yield spawn(watchForDeleteAccountSaga);
  yield spawn(watchForAccountRemovedSaga);
  yield spawn(watchForUpdateAccountSaga);
  yield spawn(watchForAccountChangedSaga);
  yield spawn(watchForCreateAccountSaga);
  yield spawn(watchForAccountAddedSaga);
  yield spawn(watchForDeleteSubAccountSaga);
  yield spawn(watchForUpdateSubAccountSaga);
  yield spawn(watchForSubAccountRemovedSaga);
  yield spawn(watchForSubAccountChangedSaga);
  yield spawn(watchForSubAccountAddedSaga);
}
