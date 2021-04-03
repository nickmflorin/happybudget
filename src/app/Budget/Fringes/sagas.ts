import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { ActionType } from "../actions";
import { getFringesTask, handleFringeRemovalTask, handleFringeUpdateTask } from "./tasks";

function* watchForRequestFringesSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Fringes.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getFringesTask, action);
  }
}

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Remove, handleFringeRemovalTask);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Update, handleFringeUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestFringesSaga);
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
}
