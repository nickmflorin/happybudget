import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce, takeEvery } from "redux-saga/effects";
import { ActionType } from "./actions";
import { getBudgetsTask, deleteBudgetTask, restoreBudgetTask, permanentlyDeleteBudgetTask } from "./tasks";

function* watchForBudgetsRefreshSaga(): SagaIterator {
  yield takeLatest(
    [
      ActionType.Budgets.Request,
      ActionType.Budgets.SetPage,
      ActionType.Budgets.SetPageSize,
      ActionType.Budgets.SetPageAndSize
    ],
    getBudgetsTask
  );
}

function* watchForSearchBudgetsSaga(): SagaIterator {
  yield debounce(250, ActionType.Budgets.SetSearch, getBudgetsTask);
}

function* watchForDeleteBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.Delete, deleteBudgetTask);
}

function* watchForPermanentlyDeleteBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.PermanentlyDelete, permanentlyDeleteBudgetTask);
}

function* watchForRestoreBudgetSaga(): SagaIterator {
  yield takeEvery(ActionType.Budgets.Restore, restoreBudgetTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
  yield spawn(watchForDeleteBudgetSaga);
  yield spawn(watchForPermanentlyDeleteBudgetSaga);
  yield spawn(watchForRestoreBudgetSaga);
}
