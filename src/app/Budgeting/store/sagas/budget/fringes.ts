import { SagaIterator } from "redux-saga";
import { spawn, takeEvery, take, cancel, call } from "redux-saga/effects";

import * as api from "api";
import { takeWithCancellableById } from "lib/redux/sagas";
import { ActionType } from "../../actions";
import * as actions from "../../actions/budget/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Budget>(
  {
    response: actions.responseFringesAction,
    loading: actions.loadingFringesAction,
    addToState: actions.addFringeToStateAction,
    deleting: actions.deletingFringeAction,
    creating: actions.creatingFringeAction,
    updating: actions.updatingFringeAction,
    removeFromState: actions.removeFringeFromStateAction,
    updateInState: actions.updateFringeInStateAction
  },
  {
    request: api.getBudgetFringes,
    create: api.createBudgetFringe,
    bulkUpdate: api.bulkUpdateBudgetFringes,
    bulkCreate: api.bulkCreateBudgetFringes,
    bulkDelete: api.bulkDeleteBudgetFringes
  },
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Modules.ApplicationStore) => state.budgeting.budget.fringes.data
);

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Budget.Fringes.Delete, tasks.handleRemoval, (p: number) => p);
}

function* watchForTableChangeSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.TableChanged, tasks.handleTableChange);
}

function* watchForBulkCreateFringesSaga(): SagaIterator {
  yield takeEvery(ActionType.Budget.Fringes.BulkCreate, tasks.bulkCreate);
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
  yield spawn(watchForBulkCreateFringesSaga);
}
