import { SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import accountSaga from "./Account/sagas";
import accountsSaga from "./Accounts/sagas";
import subAccountSaga from "./SubAccount/sagas";

export default function* rootSaga(): SagaIterator {
  yield spawn(accountSaga);
  yield spawn(accountsSaga);
  yield spawn(subAccountSaga);
}
