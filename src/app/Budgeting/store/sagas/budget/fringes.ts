import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";
import { ActionType } from "../../actions";
import {
  handleFringeRemovalTask,
  handleFringeUpdateTask,
  handleFringesBulkUpdateTask
} from "../../tasks/budget/fringes";

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Remove, handleFringeRemovalTask);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Update, handleFringeUpdateTask);
}

function* watchForBulkUpdateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.BulkUpdateFringes, handleFringesBulkUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
  yield spawn(watchForBulkUpdateFringesSaga);
}
