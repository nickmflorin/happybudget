import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";

import * as api from "api";
import * as actions from "./actions";

// TODO: These need to be paginated!
export function* getBudgetsTask(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.budgets.search
    };
  });
  yield put(actions.loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield call(
      api.getBudgets,
      { ...query, no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(actions.responseBudgetsAction(response));
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the budgets.");
      yield put(actions.responseBudgetsAction({ count: 0, data: [] }));
    }
  } finally {
    yield put(actions.loadingBudgetsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

// TODO: These need to be paginated!
export function* getTemplatesTask(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.templates.search
    };
  });
  yield put(actions.loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield call(
      api.getTemplates,
      { ...query, no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(actions.responseTemplatesAction(response));
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the templates.");
      yield put(actions.responseTemplatesAction({ count: 0, data: [] }));
    }
  } finally {
    yield put(actions.loadingTemplatesAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

// TODO: These need to be paginated!
export function* getCommunityTemplatesTask(action: Redux.Action): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Application.Authenticated.Store) => {
    return {
      search: state.dashboard.community.search
    };
  });
  yield put(actions.loadingCommunityTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield call(
      api.getCommunityTemplates,
      { ...query, no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(actions.responseCommunityTemplatesAction(response));
  } catch (e: unknown) {
    if (!(yield cancelled())) {
      api.handleRequestError(e as Error, "There was an error retrieving the community templates.");
      yield put(actions.responseCommunityTemplatesAction({ count: 0, data: [] }));
    }
  } finally {
    yield put(actions.loadingCommunityTemplatesAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}
