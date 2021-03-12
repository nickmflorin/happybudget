import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil } from "lodash";
import { getBudget } from "services";
import { handleRequestError } from "store/tasks";
import { setAncestorsAction, setAncestorsLoadingAction, loadingBudgetAction, responseBudgetAction } from "./actions";

export function* getBudgetTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(setAncestorsLoadingAction(true));
    yield put(loadingBudgetAction(true));
    try {
      const response: IBudget = yield call(getBudget, budgetId);
      yield put(responseBudgetAction(response));
      yield put(
        setAncestorsAction([
          {
            id: response.id,
            identifier: response.name,
            type: "budget"
          }
        ])
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget.");
      yield put(responseBudgetAction(undefined, { error: e }));
    } finally {
      yield put(setAncestorsLoadingAction(false));
      yield put(loadingBudgetAction(false));
    }
  }
}
