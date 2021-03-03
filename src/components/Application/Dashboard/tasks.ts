import { isNil } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { getBudgets, getBudgetsInTrash, deleteBudget, restoreBudget, permanentlyDeleteBudget } from "services";
import { handleRequestError } from "store/tasks";
import {
  ActionDomains,
  loadingBudgetsAction,
  responseBudgetsAction,
  deletingBudgetAction,
  removeBudgetFromStateAction,
  restoringBudgetAction,
  permanentlyDeletingBudgetAction
} from "./actions";

export function* getBudgetsTask(action: Redux.Dashboard.IAction<any>): SagaIterator {
  const query = yield select((state: Redux.IApplicationStore) => {
    if (action.domain === ActionDomains.ACTIVE) {
      return {
        search: state.dashboard.budgets.active.search,
        page_size: state.dashboard.budgets.active.pageSize,
        page: state.dashboard.budgets.active.page
      };
    }
    return {
      search: state.dashboard.budgets.trash.search,
      page_size: state.dashboard.budgets.trash.pageSize,
      page: state.dashboard.budgets.trash.page
    };
  });
  yield put(loadingBudgetsAction(action.domain, true));
  try {
    let response: Http.IListResponse<IBudget>;
    if (action.domain === ActionDomains.ACTIVE) {
      response = yield call(getBudgets, query);
    } else {
      response = yield call(getBudgetsInTrash, query);
    }
    yield put(responseBudgetsAction(action.domain, response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the budgets.");
    yield put(responseBudgetsAction(action.domain, { count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingBudgetsAction(action.domain, false));
  }
}

export function* deleteBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingBudgetAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted budget to the TRASh domain state?
      yield call(deleteBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.ACTIVE, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the budget.");
    } finally {
      yield put(deletingBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* restoreBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(restoringBudgetAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted budget to the ACTIVE domain state?
      yield call(restoreBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.TRASH, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error restoring the budget.");
    } finally {
      yield put(restoringBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* permanentlyDeleteBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(permanentlyDeletingBudgetAction({ id: action.payload, value: true }));
    try {
      yield call(permanentlyDeleteBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.TRASH, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the budget.");
    } finally {
      yield put(permanentlyDeletingBudgetAction({ id: action.payload, value: false }));
    }
  }
}
