import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";

import { takeWithCancellableById } from "lib/redux/sagas";
import { ActionType } from "../../actions";
import { handleRemovalTask, handleUpdateTask, handleBulkUpdateTask } from "./tasks/fringes";

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Template.Fringes.Delete, handleRemovalTask, (p: number) => p);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Fringes.Update, handleUpdateTask);
}

function* watchForBulkUpdateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.BulkUpdateFringes, handleBulkUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
  yield spawn(watchForBulkUpdateFringesSaga);
}
