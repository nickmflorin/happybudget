import { SagaIterator } from "redux-saga";
import { spawn, takeEvery, take, cancel, call } from "redux-saga/effects";

import { createBudgetFringe, bulkUpdateBudgetFringes, bulkCreateBudgetFringes, getBudgetFringes } from "api/services";
import { takeWithCancellableById } from "lib/redux/sagas";
import { ActionType } from "../../actions";
import {
  activatePlaceholderAction,
  addFringesPlaceholdersToStateAction,
  deletingFringeAction,
  creatingFringeAction,
  updatingFringeAction,
  removePlaceholderFromStateAction,
  removeFringeFromStateAction,
  updatePlaceholderInStateAction,
  addErrorsToStateAction,
  updateFringeInStateAction,
  responseFringesAction,
  loadingFringesAction,
  clearFringesPlaceholdersToStateAction
} from "../../actions/budget/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Budget>(
  {
    response: responseFringesAction,
    loading: loadingFringesAction,
    addPlaceholdersToState: addFringesPlaceholdersToStateAction,
    clearPlaceholders: clearFringesPlaceholdersToStateAction,
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
    request: getBudgetFringes,
    create: createBudgetFringe,
    bulkUpdate: bulkUpdateBudgetFringes,
    bulkCreate: bulkCreateBudgetFringes
  },
  (state: Redux.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.data,
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.placeholders
);

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Fringes.Delete, tasks.handleRemoval, (p: number) => p);
}

function* watchForTableChangeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.TableChanged, tasks.handleTableChange);
}

function* watchForRequestFringesSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Fringes.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getFringes, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestFringesSaga);
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForTableChangeSaga);
}
