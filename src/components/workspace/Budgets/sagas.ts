import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, debounce } from "redux-saga/effects";
import { ActionType } from "./actions";
import { getBudgetsTask } from "./tasks";

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

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForBudgetsRefreshSaga);
  yield spawn(watchForSearchBudgetsSaga);
}
