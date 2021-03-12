import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel } from "redux-saga/effects";
import { ActionType } from "./actions";
import { getBudgetTask } from "./tasks";

function* watchForRequestBudgetSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetTask, action);
  }
}

function* watchForBudgetIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetTask, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(watchForBudgetIdChangedSaga);
}
