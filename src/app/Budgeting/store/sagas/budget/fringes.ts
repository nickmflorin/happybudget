import { SagaIterator } from "redux-saga";
import { spawn, takeEvery } from "redux-saga/effects";

import { createBudgetFringe, bulkUpdateBudgetFringes, bulkCreateBudgetFringes } from "api/services";
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
} from "../../actions/budget/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Budget>(
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
    create: createBudgetFringe,
    bulkUpdate: bulkUpdateBudgetFringes,
    bulkCreate: bulkCreateBudgetFringes
  },
  (state: Redux.ApplicationStore) => state.budget.budget.id,
  (state: Redux.ApplicationStore) => state.budget.fringes.data,
  (state: Redux.ApplicationStore) => state.budget.fringes.placeholders
);

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Fringes.Delete, tasks.handleRemoval, (p: number) => p);
}

function* watchForUpdateFringeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.Update, tasks.handleUpdate);
}

function* watchForBulkUpdateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.BulkUpdateFringes, tasks.handleBulkUpdate);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForUpdateFringeSaga);
  yield spawn(watchForBulkUpdateFringesSaga);
}
