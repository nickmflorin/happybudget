import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork } from "redux-saga/effects";

import { ActionType } from "../../actions";
import { getTemplateTask, handleTemplateChangedTask } from "../../tasks/template";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import fringesSaga from "./fringes";
import subAccountSaga from "./subAccount";

function* watchForTemplateIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(handleTemplateChangedTask, action);
  }
}

function* watchForRequestTemplateSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    yield take(ActionType.Template.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(getTemplateTask);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestTemplateSaga);
  yield spawn(watchForTemplateIdChangedSaga);
  yield spawn(accountSaga);
  yield spawn(budgetSaga);
  yield spawn(subAccountSaga);
  yield spawn(fringesSaga);
}
