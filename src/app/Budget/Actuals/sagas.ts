import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, takeEvery } from "redux-saga/effects";
import { isNil } from "lodash";
import { ActionType } from "../actions";
import {
  getActualsTask,
  handleActualRemovalTask,
  handleActualUpdateTask,
  getBudgetItemsTask,
  getBudgetItemsTreeTask,
  handleActualPlaceholderActivatedTask,
  handleActualUpdatedInStateTask
} from "./tasks";

function* watchForRequestActualsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Actuals.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getActualsTask, action);
  }
}

function* watchForRequestBudgetItemsSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItems.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTask, action);
  }
}

function* watchForRequestBudgetItemsTreeSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.BudgetItemsTree.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getBudgetItemsTreeTask, action);
  }
}

function* watchForRemoveActualSaga(): SagaIterator {
  yield takeEvery(ActionType.Actuals.Remove, handleActualRemovalTask);
}

function* watchForActualUpdateSaga(): SagaIterator {
  yield takeEvery(ActionType.Actuals.Update, handleActualUpdateTask);
}

function* watchForActualAddedToStateSaga(): SagaIterator {
  let lastTasks: { [key: number]: any[] } = {};
  while (true) {
    const action: Redux.IAction<Table.ActivatePlaceholderPayload<IActual>> = yield take(
      ActionType.Actuals.Placeholders.Activate
    );
    if (!isNil(action.payload)) {
      if (isNil(lastTasks[action.payload.model.id])) {
        lastTasks[action.payload.model.id] = [];
      }
      // If there were any previously submitted tasks to add the same group,
      // cancel them.
      if (lastTasks[action.payload.model.id].length !== 0) {
        const cancellable = lastTasks[action.payload.model.id];
        lastTasks = { ...lastTasks, [action.payload.model.id]: [] };
        yield cancel(cancellable);
      }
      lastTasks[action.payload.model.id].push(yield call(handleActualPlaceholderActivatedTask, action));
    }
  }
}

function* watchForActualUpdatedInStateSaga(): SagaIterator {
  yield takeEvery(ActionType.Actuals.UpdateInState, handleActualUpdatedInStateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestActualsSaga);
  yield spawn(watchForRemoveActualSaga);
  yield spawn(watchForActualUpdateSaga);
  yield spawn(watchForRequestBudgetItemsSaga);
  yield spawn(watchForRequestBudgetItemsTreeSaga);
  yield spawn(watchForActualAddedToStateSaga);
  yield spawn(watchForActualUpdatedInStateSaga);
}
