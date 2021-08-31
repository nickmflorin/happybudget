import { SagaIterator } from "redux-saga";
import { spawn, call, put, select, takeLatest, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";

import * as actions from "../actions";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import subAccountSaga from "./subAccount";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

export function* getTemplateTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Application.Authenticated.Store) => state.template.id);
  if (!isNil(templateId)) {
    yield put(actions.loadingTemplateAction(true));
    try {
      const response: Model.Template = yield call(api.getTemplate, templateId, { cancelToken: source.token });
      yield put(actions.responseTemplateAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the template.");
        yield put(actions.responseTemplateAction(undefined));
      }
    } finally {
      yield put(actions.loadingTemplateAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* watchForRequestTemplateSaga(): SagaIterator {
  yield takeLatest([actions.ActionType.Request, actions.ActionType.SetId], getTemplateTask);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestTemplateSaga);
  yield spawn(accountSaga);
  yield spawn(budgetSaga);
  yield spawn(subAccountSaga);
}
