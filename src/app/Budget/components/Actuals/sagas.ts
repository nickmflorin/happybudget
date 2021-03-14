import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "./actions";
import {
  getActualsTask,
  handleActualRemovalTask,
  handleActualUpdateTask,
  getBudgetItemsTask,
  getBudgetItemsTreeTask
} from "./tasks";

function* watchForTriggerBudgetActualsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.ActualsTable.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getActualsTask, action);
  }
}

function* watchForTriggerBudgetItemsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItems.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTask, action);
  }
}

function* watchForTriggerBudgetItemsTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItemsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTreeTask, action);
  }
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeEvery(ActionType.Remove, handleActualRemovalTask);
}

function* watchForActualUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Update, handleActualUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTriggerBudgetActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForActualUpdateSaga);
  yield spawn(watchForTriggerBudgetItemsSaga);
  yield spawn(watchForTriggerBudgetItemsTreeSaga);
}
