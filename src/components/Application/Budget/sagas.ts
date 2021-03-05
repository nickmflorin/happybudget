import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import { getBudgetAccountsTask, deleteAccountTask, removeAccountFromStateTask } from "./tasks";

function* watchForTriggerBudgetAccountsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Accounts.Request);
    if (!isNil(action.budgetId)) {
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(getBudgetAccountsTask, action);
    }
  }
}

// TODO: Figure out how to prevent this from firing twice if we are attempting
// to delete the same account multiple times.  We don't want to prevent multiple
// actions from going through, if there are multiple budgets being deleted
// howerver.
function* watchForDeleteAccountAction(): SagaIterator {
  yield takeEvery(ActionType.DeleteAccount, deleteAccountTask);
}

function* watchForAccountRemovedAction(): SagaIterator {
  yield takeEvery(ActionType.AccountRemoved, removeAccountFromStateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetAccountsSaga);
  yield spawn(watchForDeleteAccountAction);
  yield spawn(watchForAccountRemovedAction);
}
