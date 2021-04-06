import { SagaIterator } from "redux-saga";
import { call, put, select, all, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";
import { handleRequestError } from "api";
import { getBudget, getBudgetItems, getBudgetItemsTree, getFringes } from "api/services";
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
} from "../actions";

export function* handleBudgetChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([call(getBudgetTask), call(getBudgetItemsTask), call(getBudgetItemsTreeTask), call(getFringesTask)]);
}

export function* getBudgetTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    yield put(loadingBudgetAction(true));
    try {
      const response: IBudget = yield call(getBudget, budgetId, { cancelToken: source.token });
      yield put(responseBudgetAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget.");
      yield put(responseBudgetAction(undefined, { error: e }));
    } finally {
      yield put(loadingBudgetAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getBudgetItemsTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    yield put(loadingBudgetItemsAction(true));
    try {
      const response = yield call(getBudgetItems, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseBudgetItemsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getBudgetItemsTreeTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    yield put(loadingBudgetItemsTreeAction(true));
    try {
      const response = yield call(getBudgetItemsTree, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseBudgetItemsTreeAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's items.");
      yield put(responseBudgetItemsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetItemsTreeAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getFringesTask(): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    yield put(clearFringesPlaceholdersToStateAction());
    yield put(loadingFringesAction(true));
    try {
      const response = yield call(getFringes, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseFringesAction(response));
      if (response.data.length === 0) {
        yield put(addFringesPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's fringes.");
      yield put(responseFringesAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingFringesAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}
