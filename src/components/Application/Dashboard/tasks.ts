import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { getBudgets, getBudgetsInTrash } from "services";
import { handleRequestError } from "store/tasks";
import { ActionDomains, loadingBudgetsAction, responseBudgetsAction } from "./actions";

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
