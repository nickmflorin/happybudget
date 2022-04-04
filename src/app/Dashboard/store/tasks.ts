import { SagaIterator } from "redux-saga";
import { all, put, select, call } from "redux-saga/effects";

import * as api from "api";
import { notifications, http } from "lib";
import * as actions from "./actions";

export function* getBudgetsTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => ({
    search: state.dashboard.budgets.search,
    page: state.dashboard.budgets.page,
    page_size: state.dashboard.budgets.pageSize,
    ordering: state.dashboard.budgets.ordering
  }));
  yield put(actions.loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield http.request(api.getBudgets, action.context, query);
    yield put(actions.responseBudgetsAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseBudgetsAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingBudgetsAction(false));
  }
}

export function* getBudgetsPermissioningTask(action: Redux.Action<null>): SagaIterator {
  yield put(actions.loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield http.request(api.getBudgets, action.context, {});
    yield put(actions.responsePermissionedBudgetsAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseBudgetsAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingBudgetsAction(false));
  }
}

export function* getArchiveTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => ({
    search: state.dashboard.archive.search,
    page: state.dashboard.archive.page,
    page_size: state.dashboard.archive.pageSize,
    ordering: state.dashboard.archive.ordering
  }));
  yield put(actions.loadingArchiveAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield http.request(
      api.getArchivedBudgets,
      action.context,
      query
    );
    yield put(actions.responseArchiveAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseArchiveAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingArchiveAction(false));
  }
}

export function* getArchivePermissioningTask(action: Redux.Action<null>): SagaIterator {
  yield put(actions.loadingArchiveAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield http.request(
      api.getArchivedBudgets,
      action.context,
      {}
    );
    yield put(actions.responsePermissionedArchiveAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseArchiveAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingArchiveAction(false));
  }
}

export function* getCollaboratingTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => ({
    search: state.dashboard.collaborating.search,
    page: state.dashboard.collaborating.page,
    page_size: state.dashboard.collaborating.pageSize,
    ordering: state.dashboard.collaborating.ordering
  }));
  yield put(actions.loadingCollaboratingAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleCollaboratingBudget> = yield http.request(
      api.getCollaboratingBudgets,
      action.context,
      query
    );
    yield put(actions.responseCollaboratingAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseCollaboratingAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingCollaboratingAction(false));
  }
}

export function* getTemplatesTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => {
    return {
      search: state.dashboard.templates.search,
      page: state.dashboard.templates.page,
      page_size: state.dashboard.templates.pageSize,
      ordering: state.dashboard.templates.ordering
    };
  });
  yield put(actions.loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield http.request(
      api.getTemplates,
      action.context,
      query
    );
    yield put(actions.responseTemplatesAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseTemplatesAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingTemplatesAction(false));
  }
}

export function* getCommunityTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => {
    return {
      search: state.dashboard.community.search,
      page: state.dashboard.community.page,
      page_size: state.dashboard.community.pageSize,
      ordering: state.dashboard.community.ordering
    };
  });
  yield put(actions.loadingCommunityAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield http.request(
      api.getCommunityTemplates,
      action.context,
      query
    );
    yield put(actions.responseCommunityAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseCommunityAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingCommunityAction(false));
  }
}

export function* getDataTask(action: Redux.Action<null>): SagaIterator {
  yield all([
    call(getBudgetsTask, action),
    call(getArchiveTask, action),
    call(getTemplatesTask, action),
    call(getCollaboratingTask, action)
  ]);
}
