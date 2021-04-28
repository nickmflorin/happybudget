import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";

import { createTemplateFringe, bulkUpdateTemplateFringes, bulkCreateTemplateFringes } from "api/services";
import { takeWithCancellableById } from "lib/redux/sagas";
import { ActionType } from "../../actions";
import {
  activatePlaceholderAction,
  deletingFringeAction,
  creatingFringeAction,
  updatingFringeAction,
  removePlaceholderFromStateAction,
  removeFringeFromStateAction,
  updatePlaceholderInStateAction,
  addErrorsToStateAction,
  updateFringeInStateAction
} from "../../actions/template/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Template>(
  {
    activatePlaceholder: activatePlaceholderAction,
    deleting: deletingFringeAction,
    creating: creatingFringeAction,
    updating: updatingFringeAction,
    removePlaceholderFromState: removePlaceholderFromStateAction,
    removeFromState: removeFringeFromStateAction,
    updatePlaceholderInState: updatePlaceholderInStateAction,
    addErrorsToState: addErrorsToStateAction,
    updateInState: updateFringeInStateAction
  },
  {
    create: createTemplateFringe,
    bulkUpdate: bulkUpdateTemplateFringes,
    bulkCreate: bulkCreateTemplateFringes
  },
  (state: Redux.ApplicationStore) => state.template.template.id,
  (state: Redux.ApplicationStore) => state.template.fringes.data,
  (state: Redux.ApplicationStore) => state.template.fringes.placeholders
);

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Template.Fringes.Delete, tasks.handleRemoval, (p: number) => p);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Fringes.Update, tasks.handleUpdate);
}

function* watchForBulkUpdateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.BulkUpdateFringes, tasks.handleBulkUpdate);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
  yield spawn(watchForBulkUpdateFringesSaga);
}
