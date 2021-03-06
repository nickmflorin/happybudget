import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import {
  getAccountsTask,
  getAccountSubAccountsTask,
  getSubAccountSubAccountsTask,
  handleAccountRowUpdateTask,
  handleAccountSubAccountRowUpdateTask,
  handleAccountSubAccountRowRemovalTask,
  handleAccountRowRemovalTask,
  handleSubAccountSubAccountRowUpdateTask,
  handleSubAccountSubAccountRowRemovalTask
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

function* watchForTriggerSubAccountSubAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.SubAccounts.Request);
    if (!isNil(action.subaccountId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getSubAccountSubAccountsTask, action);
    }
  }
}

function* watchForAccountRemoveRowSaga(): SagaIterator {
  yield takeEvery(ActionType.AccountsTable.RemoveRow, handleAccountRowRemovalTask);
}

function* watchForSubAccountSubAccountRemoveRowSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.SubAccountsTable.RemoveRow, handleSubAccountSubAccountRowRemovalTask);
}

function* watchForAccountSubAccountRemoveRowSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccountsTable.RemoveRow, handleAccountSubAccountRowRemovalTask);
}

function* watchForAccountUpdateRowSaga(): SagaIterator {
  yield takeEvery(ActionType.AccountsTable.UpdateRow, handleAccountRowUpdateTask);
}

function* watchForAccountSubAccountUpdateRowSaga(): SagaIterator {
  yield takeEvery(ActionType.Account.SubAccountsTable.UpdateRow, handleAccountSubAccountRowUpdateTask);
}

function* watchForSubAccountSubAccountUpdateRowSaga(): SagaIterator {
  yield takeEvery(ActionType.SubAccount.SubAccountsTable.UpdateRow, handleSubAccountSubAccountRowUpdateTask);
}

function* accountsSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetAccountsSaga);
  yield spawn(watchForAccountRemoveRowSaga);
  yield spawn(watchForAccountUpdateRowSaga);
}

function* accountSubAccountsSaga(): SagaIterator {
  yield spawn(watchForTriggerAccountSubAccountsSaga);
  yield spawn(watchForAccountSubAccountUpdateRowSaga);
  yield spawn(watchForAccountSubAccountRemoveRowSaga);
}

function* subAccountSubAccountsSaga(): SagaIterator {
  yield spawn(watchForTriggerSubAccountSubAccountsSaga);
  yield spawn(watchForSubAccountSubAccountUpdateRowSaga);
  yield spawn(watchForSubAccountSubAccountRemoveRowSaga);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(accountsSaga);
  yield spawn(accountSubAccountsSaga);
  yield spawn(subAccountSubAccountsSaga);
}
