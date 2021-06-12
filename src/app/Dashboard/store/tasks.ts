import axios from "axios";
import { isNil, includes } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";

import * as api from "api";
import * as actions from "./actions";

export function* getBudgetsTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Redux.ApplicationStore) => {
    return {
      search: state.dashboard.budgets.search,
      page_size: state.dashboard.budgets.pageSize,
      page: state.dashboard.budgets.page
    };
  });
  yield put(actions.loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleBudget> = yield call(api.getBudgets, query, {
      cancelToken: source.token
    });
    yield put(actions.responseBudgetsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the budgets.");
      yield put(actions.responseBudgetsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(actions.loadingBudgetsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* getTemplatesTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Redux.ApplicationStore) => {
    return {
      search: state.dashboard.templates.search,
      page_size: state.dashboard.templates.pageSize,
      page: state.dashboard.templates.page
    };
  });
  yield put(actions.loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield call(api.getTemplates, query, {
      cancelToken: source.token
    });
    yield put(actions.responseTemplatesAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the templates.");
      yield put(actions.responseTemplatesAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(actions.loadingTemplatesAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* getCommunityTemplatesTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query = yield select((state: Redux.ApplicationStore) => {
    return {
      search: state.dashboard.community.search,
      page_size: state.dashboard.community.pageSize,
      page: state.dashboard.community.page
    };
  });
  yield put(actions.loadingCommunityTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.SimpleTemplate> = yield call(api.getCommunityTemplates, query, {
      cancelToken: source.token
    });
    yield put(actions.responseCommunityTemplatesAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the community templates.");
      yield put(actions.responseCommunityTemplatesAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(actions.loadingCommunityTemplatesAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* deleteBudgetTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deletingBudgetAction({ id: action.payload, value: true }));
    try {
      yield call(api.deleteBudget, action.payload, { cancelToken: source.token });
      yield put(actions.removeBudgetFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the budget.");
      }
    } finally {
      yield put(actions.deletingBudgetAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deletingTemplateAction({ id: action.payload, value: true }));
    try {
      yield call(api.deleteTemplate, action.payload, { cancelToken: source.token });
      yield put(actions.removeTemplateFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the template.");
      }
    } finally {
      yield put(actions.deletingTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteCommunityTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.deletingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      yield call(api.deleteTemplate, action.payload, { cancelToken: source.token });
      yield put(actions.removeCommunityTemplateFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error deleting the community template.");
      }
    } finally {
      yield put(actions.deletingCommunityTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* moveTemplateToCommunityTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.movingTemplateToCommunityAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(
        api.updateTemplate,
        action.payload,
        { community: true },
        { cancelToken: source.token }
      );
      yield put(actions.removeTemplateFromStateAction(action.payload));
      yield put(actions.addCommunityTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error moving the template to community.");
      }
    } finally {
      yield put(actions.movingTemplateToCommunityAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* duplicateTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.duplicatingTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(api.duplicateTemplate, action.payload, { cancelToken: source.token });
      yield put(actions.addTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error duplicating the template.");
      }
    } finally {
      yield put(actions.duplicatingTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* duplicateCommunityTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.duplicatingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(api.duplicateTemplate, action.payload, { cancelToken: source.token });
      yield put(actions.addTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error duplicating the template.");
      }
    } finally {
      yield put(actions.duplicatingCommunityTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* hideCommunityTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.hidingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(
        api.updateTemplate,
        action.payload,
        { hidden: true },
        { cancelToken: source.token }
      );
      yield put(actions.updateCommunityTemplateInStateAction({ id: action.payload, data: response }));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error hiding the community template.");
      }
    } finally {
      yield put(actions.hidingCommunityTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* showCommunityTemplateAction(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(actions.showingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(
        api.updateTemplate,
        action.payload,
        { hidden: false },
        { cancelToken: source.token }
      );
      yield put(actions.updateCommunityTemplateInStateAction({ id: action.payload, data: response }));
    } catch (e) {
      if (!(yield cancelled())) {
        api.handleRequestError(e, "There was an error showing the community template.");
      }
    } finally {
      yield put(actions.showingCommunityTemplateAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getContactsTask(action: Redux.Action<any>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  const query: Http.ListQuery = yield select((state: Redux.ApplicationStore) => {
    return {
      page: state.dashboard.contacts.page,
      page_size: state.dashboard.contacts.pageSize,
      search: state.dashboard.contacts.search
    };
  });
  yield put(actions.loadingContactsAction(true));
  try {
    let response: Http.ListResponse<Model.Contact> = yield call(api.getContacts, query, { cancelToken: source.token });
    yield put(actions.responseContactsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      api.handleRequestError(e, "There was an error retrieving the contacts.");
      yield put(actions.responseContactsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(actions.loadingContactsAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* deleteContactTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const deleting = yield select((state: Redux.ApplicationStore) => state.dashboard.contacts.deleting);
    if (!includes(deleting, action.payload)) {
      yield put(actions.deletingContactAction({ id: action.payload, value: true }));
      try {
        yield call(api.deleteContact, action.payload, { cancelToken: source.token });
        yield put(actions.removeContactFromStateAction(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          api.handleRequestError(e, "There was an error deleting the contact.");
        }
      } finally {
        yield put(actions.deletingContactAction({ id: action.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}
