import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil } from "lodash";
import { handleRequestError } from "api";
import { getBudget } from "services";
import { loadingBudgetAction, responseBudgetAction } from "./actions";

export function* getBudgetTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetAction(true));
    try {
      const response: IBudget = yield call(getBudget, budgetId);
      yield put(responseBudgetAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget.");
      yield put(responseBudgetAction(undefined, { error: e }));
    } finally {
      yield put(loadingBudgetAction(false));
    }
  }
}
