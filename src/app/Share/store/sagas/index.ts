import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork, call, put, select, all, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";
import { tasks } from "store";

import ActionType, { loadingBudgetAction, responseBudgetAction } from "../actions";

import accountSaga from "./account";
import accountsSaga from "./accounts";
import subAccountSaga from "./subAccount";

export function* handleBudgetChangedTask(action: Redux.Action<number>): SagaIterator {
  yield all([call(getBudgetTask), call(tasks.getSubAccountUnitsTask, action), call(tasks.getContactsTask, action)]);
}

function* getBudgetTask(): SagaIterator {
  const budgetId = yield select((state: Modules.Unauthenticated.Store) => state.share.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingBudgetAction(true));
    try {
      const response: Model.Budget = yield call(api.getBudget, budgetId, { cancelToken: source.token });
      yield put(responseBudgetAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error retrieving the budget.");
        yield put(responseBudgetAction(undefined, { error: e }));
      }
    } finally {
      yield put(loadingBudgetAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* watchForBudgetIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(handleBudgetChangedTask, action);
  }
}

function* watchForRequestBudgetSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    yield take(ActionType.Budget.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(getBudgetTask);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(watchForBudgetIdChangedSaga);
  yield spawn(accountSaga);
  yield spawn(accountsSaga);
  yield spawn(subAccountSaga);
}
