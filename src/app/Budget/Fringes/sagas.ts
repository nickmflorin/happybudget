import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";
import { ActionType } from "../actions";
import { handleFringeRemovalTask, handleFringeUpdateTask } from "./tasks";

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Remove, handleFringeRemovalTask);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Update, handleFringeUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
}
