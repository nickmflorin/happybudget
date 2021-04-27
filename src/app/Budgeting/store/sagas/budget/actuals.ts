import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";

import { takeWithCancellableById } from "lib/redux/sagas";
import { ActionType } from "../../actions";
import { getActualsTask, handleRemovalTask, handleUpdateTask, handleBulkUpdateTask } from "./tasks/actuals";

function* watchForRequestActualsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Actuals.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getActualsTask, action);
  }
}

function* watchForBulkUpdateActualsSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.BulkUpdateActuals, handleBulkUpdateTask);
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Actuals.Delete, handleRemovalTask, (p: number) => p);
}

function* watchForActualUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Actuals.Update, handleUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForActualUpdateSaga);
  yield spawn(watchForBulkUpdateActualsSaga);
}
