import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork, call, put, select, all, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";
import { handleRequestError } from "api";

import { getBudget } from "api/services";

import { ActionType } from "../../actions";
import { loadingBudgetAction, responseBudgetAction } from "../../actions/budget";
import { getFringeColorsTask } from "../tasks";

import accountSaga from "./account";
import accountsSaga from "./accounts";
import actualsSaga from "./actuals";
import fringesSaga from "./fringes";
import subAccountSaga from "./subAccount";

export function* handleBudgetChangedTask(action: Redux.Action<number>): SagaIterator {
  yield all([call(getBudgetTask), call(getFringeColorsTask)]);
}

export function* getBudgetTask(): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingBudgetAction(true));
    try {
      const response: Model.Budget = yield call(getBudget, budgetId, { cancelToken: source.token });
      yield put(responseBudgetAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the budget.");
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
  yield spawn(actualsSaga);
  yield spawn(subAccountSaga);
  yield spawn(fringesSaga);
}
