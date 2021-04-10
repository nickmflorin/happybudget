import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork } from "redux-saga/effects";

import { ActionType } from "../actions";
import { getBudgetTask, handleBudgetChangedTask } from "../tasks";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import actualsSaga from "./actuals";
import fringesSaga from "./fringes";
import subAccountSaga from "./subAccount";

function* watchForBudgetIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(handleBudgetChangedTask, action);
  }
}

function* watchForRequestBudgetSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    yield take(ActionType.Budget.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(getBudgetTask);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(watchForBudgetIdChangedSaga);
  yield spawn(accountSaga);
  yield spawn(budgetSaga);
  yield spawn(actualsSaga);
  yield spawn(subAccountSaga);
  yield spawn(fringesSaga);
}
