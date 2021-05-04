import { SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import budgetRootSaga from "./budget";
import templateRootSaga from "./template";

export default function* rootSaga(): SagaIterator {
  yield spawn(budgetRootSaga);
  yield spawn(templateRootSaga);
}
