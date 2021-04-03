import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel } from "redux-saga/effects";
import { ActionType } from "./actions";
import { getBudgetTask, getBudgetItemsTask, getBudgetItemsTreeTask } from "./tasks";

import accountSaga from "./Account/sagas";
import budgetSaga from "./Accounts/sagas";
import actualsSaga from "./Actuals/sagas";
import fringesSaga from "./Fringes/sagas";
import subAccountSaga from "./SubAccount/sagas";

function* watchForRequestBudgetSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    yield take(ActionType.Budget.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetTask);
  }
}

function* watchForBudgetIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    yield take(ActionType.Budget.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetTask);
  }
}

function* watchForRequestBudgetItemsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItems.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTask, action);
  }
}

function* watchForRequestBudgetItemsTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItemsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTreeTask, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(watchForBudgetIdChangedSaga);
  yield spawn(watchForRequestBudgetItemsSaga);
  yield spawn(watchForRequestBudgetItemsTreeSaga);
  yield spawn(accountSaga);
  yield spawn(budgetSaga);
  yield spawn(actualsSaga);
  yield spawn(subAccountSaga);
  yield spawn(fringesSaga);
}
