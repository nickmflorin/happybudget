import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, call, put, select, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";

import * as actions from "../actions";

import accountSaga from "./account";
import accountsSaga from "./accounts";
import actualsSaga from "./actuals";
import subAccountSaga from "./subAccount";
import pdfSaga from "./pdf";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

function* getBudgetTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
  if (!isNil(budgetId)) {
    yield put(actions.loadingBudgetAction(true));
    try {
      const response: Model.Budget = yield call(api.getBudget, budgetId, { cancelToken: source.token });
      yield put(actions.responseBudgetAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the budget.");
        yield put(actions.responseBudgetAction(undefined));
      }
    } finally {
      yield put(actions.loadingBudgetAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* watchForRequestBudgetSaga(): SagaIterator {
  yield takeLatest([actions.ActionType.Request, actions.ActionType.SetId], getBudgetTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestBudgetSaga);
  yield spawn(accountSaga);
  yield spawn(accountsSaga);
  yield spawn(actualsSaga);
  yield spawn(subAccountSaga);
  yield spawn(pdfSaga);
}
