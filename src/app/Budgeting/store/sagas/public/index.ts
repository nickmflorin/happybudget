import { SagaIterator } from "redux-saga";
import { spawn, takeLatest } from "redux-saga/effects";

import accountSaga from "./account";
import subAccountSaga from "./subAccount";
import * as actions from "../../actions/public";
import * as tasks from "../tasks";

export * as accounts from "./accounts";
export * as account from "./account";
export * as subAccount from "./subAccount";

export default function* rootSaga(): SagaIterator {
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), tasks.getBudget);
}
