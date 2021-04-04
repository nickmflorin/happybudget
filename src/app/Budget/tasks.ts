import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { isNil, find } from "lodash";
import { handleRequestError } from "api";
import { FringeMapping } from "model/tableMappings";
import {
  getBudget,
  getBudgetItems,
  getBudgetItemsTree,
  getFringes,
  deleteFringe,
  updateFringe,
  createFringe
} from "services";
import { handleTableErrors } from "store/tasks";
import {
  loadingBudgetAction,
  responseBudgetAction,
  loadingBudgetItemsAction,
  responseBudgetItemsAction,
  loadingBudgetItemsTreeAction,
  responseBudgetItemsTreeAction,
  loadingFringesAction,
  responseFringesAction,
  addFringesPlaceholdersToStateAction
} from "./actions";

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

export function* getBudgetItemsTask(action: Redux.IAction<null>): SagaIterator {
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

export function* getBudgetItemsTreeTask(action: Redux.IAction<null>): SagaIterator {
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

export function* getFringesTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
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
