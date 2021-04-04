import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil } from "lodash";
import { handleRequestError } from "api";
import { getBudget, getBudgetItems, getBudgetItemsTree, getFringes } from "services";
import {
  loadingBudgetAction,
  responseBudgetAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction,
  loadingBudgetItemsTreeAction,
  responseBudgetItemsTreeAction,
  loadingFringesAction,
  responseFringesAction,
  addFringesPlaceholdersToStateAction,
  clearFringesPlaceholdersToStateAction
} from "./actions";

export function* handleBudgetChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([call(getBudgetTask), call(getBudgetItemsTask), call(getBudgetItemsTreeTask), call(getFringesTask)]);
}

export function* getBudgetTask(): SagaIterator {
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

export function* getBudgetItemsTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetItemsAction(true));
    try {
      const response = yield call(getBudgetItems, budgetId, { no_pagination: true });
      yield put(responseBudgetItemsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsAction(false));
    }
  }
}

export function* getBudgetItemsTreeTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetItemsTreeAction(true));
    try {
      const response = yield call(getBudgetItemsTree, budgetId, { no_pagination: true });
      yield put(responseBudgetItemsTreeAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsTreeAction(false));
    }
  }
}

export function* getFringesTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(clearFringesPlaceholdersToStateAction());
    yield put(loadingFringesAction(true));
    try {
      const response = yield call(getFringes, budgetId, { no_pagination: true });
      yield put(responseFringesAction(response));
      if (response.data.length === 0) {
        yield put(addFringesPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's fringes.");
      yield put(responseFringesAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingFringesAction(false));
    }
  }
}
