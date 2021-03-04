import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "./actions";
import { getBudgetAccountsTask } from "./tasks";

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

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetAccountsSaga);
}
