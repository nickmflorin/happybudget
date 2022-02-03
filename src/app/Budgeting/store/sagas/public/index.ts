import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, put } from "redux-saga/effects";

import * as api from "api";
import { notifications } from "lib";

import * as actions from "../../actions/public";
import accountSaga from "./account";
import subAccountSaga from "./subAccount";

export * as accounts from "./accounts";
export * as account from "./account";
export * as subAccount from "./subAccount";

function* getBudgetTask(action: Redux.Action<number>): SagaIterator {
  yield put(actions.loadingBudgetAction(true));
  try {
    const response: Model.Budget = yield api.request(api.getBudget, action.context, action.payload);
    yield put(actions.responseBudgetAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseBudgetAction(null));
  } finally {
    yield put(actions.loadingBudgetAction(false));
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), getBudgetTask);
}
