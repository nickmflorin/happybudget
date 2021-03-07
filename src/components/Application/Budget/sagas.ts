import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import {
  getBudgetTask,
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
  handleSubAccountSubAccountRemovalTask
} from "./tasks";

function* watchForTriggerBudgetAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.AccountsTable.Request);
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
    const action = yield take(ActionType.Account.SubAccountsTable.Request);
    if (!isNil(action.budgetId) && !isNil(action.accountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getAccountSubAccountsTask, action);
    }
  }
}

function* watchForTriggerSubAccountSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.SubAccountsTable.Request);
    if (!isNil(action.subaccountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getSubAccountSubAccountsTask, action);
    }
  }
}

function* watchForRemoveAccountSaga(): SagaIterator {
  yield takeEvery(ActionType.Accounts.Remove, handleAccountRemovalTask);
}

function* watchForSubAccountSubAccountRemoveRowSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.SubAccountsTable.RemoveRow, handleSubAccountSubAccountRemovalTask);
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

function* accountsSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetAccountsSaga);
  yield spawn(watchForRemoveAccountSaga);
  yield spawn(watchForAccountUpdateSaga);
}

function* accountSubAccountsSaga(): SagaIterator {
  yield spawn(watchForTriggerAccountSubAccountsSaga);
  yield spawn(watchForUpdateSubAccountSubAccountwSaga);
  yield spawn(watchForRemoveAccountSubAccountSaga);
}

function* subAccountSubAccountsSaga(): SagaIterator {
  yield spawn(watchForTriggerSubAccountSubAccountsSaga);
  yield spawn(watchForUpdateAccountSubAccountSaga);
  yield spawn(watchForSubAccountSubAccountRemoveRowSaga);
}

function* watchForRequestBudgetSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Request);
    if (!isNil(action.budgetId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getBudgetTask, action);
    }
  }
}

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Request);
    if (!isNil(action.accountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getAccountTask, action);
    }
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.Request);
    if (!isNil(action.subaccountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getSubAccountTask, action);
    }
  }
}

function* detailsSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(watchForRequestAccountSaga);
  yield spawn(watchForRequestSubAccountSaga);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(detailsSaga);
  yield spawn(accountsSaga);
  yield spawn(accountSubAccountsSaga);
  yield spawn(subAccountSubAccountsSaga);
}
