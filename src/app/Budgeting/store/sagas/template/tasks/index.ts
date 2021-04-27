import { SagaIterator } from "redux-saga";
import { call, put, select, all, cancelled } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";
import { handleRequestError } from "api";
import { getTemplate, getTemplateFringes } from "api/services";
import {
  loadingTemplateAction,
  responseTemplateAction,
  loadingFringesAction,
  responseFringesAction,
  addFringesPlaceholdersToStateAction,
  clearFringesPlaceholdersToStateAction
} from "../../../actions/template";

export function* handleTemplateChangedTask(action: Redux.Action<number>): SagaIterator {
  yield all([call(getTemplateTask), call(getFringesTask)]);
}

export function* getTemplateTask(): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
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

export function* getFringesTask(): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(clearFringesPlaceholdersToStateAction(null));
    yield put(loadingFringesAction(true));
    try {
      const response = yield call(
        getTemplateFringes,
        templateId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseFringesAction(response));
      if (response.data.length === 0) {
        yield put(addFringesPlaceholdersToStateAction(2));
      }
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the template's fringes.");
        yield put(responseFringesAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingFringesAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}
