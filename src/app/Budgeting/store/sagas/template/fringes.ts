import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";
import { ActionType } from "../../actions";
import {
  handleFringeRemovalTask,
  handleFringeUpdateTask,
  handleFringesBulkUpdateTask
} from "../../tasks/template/fringes";

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Fringes.Remove, handleFringeRemovalTask);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Fringes.Update, handleFringeUpdateTask);
}

function* watchForBulkUpdateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.BulkUpdateFringes, handleFringesBulkUpdateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
  yield spawn(watchForBulkUpdateFringesSaga);
}
