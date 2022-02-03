import { SagaIterator } from "redux-saga";
import { spawn, take, cancel, fork, put } from "redux-saga/effects";

import * as api from "api";
import { notifications } from "lib";

import * as actions from "../../actions/budget/pdf";

function* loadHeaderTemplateTask(action: Redux.Action<number>): SagaIterator {
  yield put(actions.setLoadingHeaderTemplateDetailAction(true));
  try {
    const response: Model.HeaderTemplate = yield api.request(api.getHeaderTemplate, action.context, action.payload);
    yield put(actions.displayHeaderTemplateAction(response));
  } catch (e: unknown) {
    // TODO: It would be more appropriate to show the error in the Modal.
    notifications.ui.banner.handleRequestError(e as Error);
  } finally {
    yield put(actions.setLoadingHeaderTemplateDetailAction(false));
  }
}

function* watchForLoadHeaderTemplateTask(): SagaIterator {
  let lastTasks;
  while (true) {
    const action: Redux.Action<number> = yield take(actions.loadHeaderTemplateAction.toString());
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(loadHeaderTemplateTask, action);
  }
}

function* getHeaderTemplatesTask(action: Redux.Action<null>): SagaIterator {
  yield put(actions.loadingHeaderTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleHeaderTemplate> = yield api.request(
      api.getHeaderTemplates,
      action.context,
      {}
    );
    yield put(actions.responseHeaderTemplatesAction(response));
  } catch (e: unknown) {
    // TODO: It would be more appropriate to show the error in the Modal.
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseHeaderTemplatesAction({ data: [], count: 0 }));
  } finally {
    yield put(actions.loadingHeaderTemplatesAction(false));
  }
}

function* watchForRequestHeaderTemplatesSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(actions.requestHeaderTemplatesAction.toString());
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield fork(getHeaderTemplatesTask, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestHeaderTemplatesSaga);
  yield spawn(watchForLoadHeaderTemplateTask);
}
