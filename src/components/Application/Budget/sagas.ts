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
