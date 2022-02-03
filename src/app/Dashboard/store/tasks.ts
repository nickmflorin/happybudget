import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import * as api from "api";
import { notifications } from "lib";
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
    const response: Http.ListResponse<Model.SimpleBudget> = yield api.request(api.getBudgets, action.context, query);
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
    const response: Http.ListResponse<Model.SimpleBudget> = yield api.request(api.getBudgets, action.context, {});
    yield put(actions.responsePermissionedBudgetsAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseBudgetsAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingBudgetsAction(false));
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
    const response: Http.ListResponse<Model.SimpleTemplate> = yield api.request(
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

export function* getCommunityTemplatesTask(action: Redux.Action<null>): SagaIterator {
  const query = yield select((state: Application.Store) => {
    return {
      search: state.dashboard.community.search,
      page: state.dashboard.community.page,
      page_size: state.dashboard.community.pageSize,
      ordering: state.dashboard.community.ordering
    };
  });
  yield put(actions.loadingCommunityTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield api.request(
      api.getCommunityTemplates,
      action.context,
      query
    );
    yield put(actions.responseCommunityTemplatesAction(response));
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(actions.responseCommunityTemplatesAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingCommunityTemplatesAction(false));
  }
}
