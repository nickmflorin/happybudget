import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { getBudgets } from "services";
import { handleRequestError } from "store/tasks";
import { loadingBudgetsAction, responseBudgetsAction } from "./actions";

export function* getBudgetsTask(action: Redux.IAction<any>): SagaIterator {
  const query = yield select((state: Redux.IApplicationStore) => {
    return {
      search: state.budgets.budgets.search,
      page_size: state.budgets.budgets.pageSize,
      page: state.budgets.budgets.page
    };
  });
  yield put(loadingBudgetsAction(true));
  try {
    const response = yield call(getBudgets, query);
    yield put(responseBudgetsAction(response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the budgets.");
    yield put(responseBudgetsAction({ count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingBudgetsAction(false));
  }
}
