import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork, call, put, select, all, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";
import { handleRequestError } from "api";
import { getTemplate } from "api/services";

import { ActionType } from "../../actions";
import { loadingTemplateAction, responseTemplateAction } from "../../actions/template";
import { getFringeColorsTask, getSubAccountUnitsTask } from "../tasks";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import fringesSaga from "./fringes";
import subAccountSaga from "./subAccount";

export function* handleTemplateChangedTask(action: Redux.Action<number>): SagaIterator {
  // TODO: Maybe we should not call getFringeColorsTask whenever the template/budget changes but
  // just once.  Same thing goes for the Sub Account Units.
  yield all([call(getTemplateTask), call(getFringeColorsTask), call(getSubAccountUnitsTask)]);
}

export function* getTemplateTask(): SagaIterator {
  const templateId = yield select((state: Modules.ApplicationStore) => state.budgeting.template.template.id);
  if (!isNil(templateId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingTemplateAction(true));
    try {
      const response: Model.Template = yield call(getTemplate, templateId, { cancelToken: source.token });
      yield put(responseTemplateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the template.");
        yield put(responseTemplateAction(undefined, { error: e }));
      }
    } finally {
      yield put(loadingTemplateAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

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
