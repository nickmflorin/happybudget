import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import * as api from "api";
import { notifications } from "lib";
import * as actions from "./actions";

export function* getBudgetsTask(action: Redux.Action): SagaIterator {
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.budgets.search
    };
  });
  yield put(actions.loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield api.request(api.getBudgets, {
      ...query,
      no_pagination: true
    });
    yield put(actions.responseBudgetsAction(response));
  } catch (e: unknown) {
    notifications.requestError(e as Error, "There was an error retrieving the budgets.");
    yield put(actions.responseBudgetsAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingBudgetsAction(false));
  }
}

export function* getTemplatesTask(action: Redux.Action): SagaIterator {
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.templates.search
    };
  });
  yield put(actions.loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield api.request(api.getTemplates, {
      ...query,
      no_pagination: true
    });
    yield put(actions.responseTemplatesAction(response));
  } catch (e: unknown) {
    notifications.requestError(e as Error, "There was an error retrieving the templates.");
    yield put(actions.responseTemplatesAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingTemplatesAction(false));
  }
}

export function* getCommunityTemplatesTask(action: Redux.Action): SagaIterator {
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.community.search
    };
  });
  yield put(actions.loadingCommunityTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield api.request(api.getCommunityTemplates, {
      ...query,
      no_pagination: true
    });
    yield put(actions.responseCommunityTemplatesAction(response));
  } catch (e: unknown) {
    notifications.requestError(e as Error, "There was an error retrieving the community templates.");
    yield put(actions.responseCommunityTemplatesAction({ count: 0, data: [] }));
  } finally {
    yield put(actions.loadingCommunityTemplatesAction(false));
  }
}
