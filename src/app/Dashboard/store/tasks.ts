import axios from "axios";
import { isNil, includes } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";
import {
  getBudgets,
  getTemplates,
  deleteBudget,
  deleteTemplate,
  getContacts,
  deleteContact,
  getCommunityTemplates,
  updateTemplate,
  duplicateTemplate
} from "api/services";
import { handleRequestError } from "api";
import {
  loadingBudgetsAction,
  loadingTemplatesAction,
  loadingCommunityTemplatesAction,
  responseBudgetsAction,
  responseTemplatesAction,
  responseCommunityTemplatesAction,
  removeBudgetFromStateAction,
  removeTemplateFromStateAction,
  loadingContactsAction,
  responseContactsAction,
  deletingContactAction,
  removeContactFromStateAction,
  removeCommunityTemplateFromStateAction,
  addCommunityTemplateToStateAction,
  addTemplateToStateAction,
  duplicatingTemplateAction,
  duplicatingCommunityTemplateAction,
  deletingBudgetAction,
  deletingTemplateAction,
  deletingCommunityTemplateAction,
  movingTemplateToCommunityAction
} from "./actions";

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
  yield put(loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.Budget> = yield call(getBudgets, query, { cancelToken: source.token });
    yield put(responseBudgetsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error retrieving the budgets.");
      yield put(responseBudgetsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingBudgetsAction(false));
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
  yield put(loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.Template> = yield call(getTemplates, query, { cancelToken: source.token });
    yield put(responseTemplatesAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error retrieving the templates.");
      yield put(responseTemplatesAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingTemplatesAction(false));
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
  yield put(loadingCommunityTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.Template> = yield call(getCommunityTemplates, query, {
      cancelToken: source.token
    });
    yield put(responseCommunityTemplatesAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error retrieving the community templates.");
      yield put(responseCommunityTemplatesAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingCommunityTemplatesAction(false));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* deleteBudgetTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(deletingBudgetAction({ id: action.payload, value: true }));
    try {
      yield call(deleteBudget, action.payload, { cancelToken: source.token });
      yield put(removeBudgetFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the budget.");
      }
    } finally {
      yield put(deletingBudgetAction({ id: action.payload, value: false }));
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
    yield put(deletingTemplateAction({ id: action.payload, value: true }));
    try {
      yield call(deleteTemplate, action.payload, { cancelToken: source.token });
      yield put(removeTemplateFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the template.");
      }
    } finally {
      yield put(deletingTemplateAction({ id: action.payload, value: false }));
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
    yield put(deletingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      yield call(deleteTemplate, action.payload, { cancelToken: source.token });
      yield put(removeCommunityTemplateFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the community template.");
      }
    } finally {
      yield put(deletingCommunityTemplateAction({ id: action.payload, value: false }));
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
    yield put(movingTemplateToCommunityAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(
        updateTemplate,
        action.payload,
        { community: true },
        { cancelToken: source.token }
      );
      yield put(removeTemplateFromStateAction(action.payload));
      yield put(addCommunityTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error moving the template to community.");
      }
    } finally {
      yield put(movingTemplateToCommunityAction({ id: action.payload, value: false }));
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
    yield put(duplicatingTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(duplicateTemplate, action.payload, { cancelToken: source.token });
      yield put(addTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error duplicating the template.");
      }
    } finally {
      yield put(duplicatingTemplateAction({ id: action.payload, value: false }));
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
    yield put(duplicatingCommunityTemplateAction({ id: action.payload, value: true }));
    try {
      const response: Model.Template = yield call(duplicateTemplate, action.payload, { cancelToken: source.token });
      yield put(addTemplateToStateAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error duplicating the template.");
      }
    } finally {
      yield put(duplicatingCommunityTemplateAction({ id: action.payload, value: false }));
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
  yield put(loadingContactsAction(true));
  try {
    let response: Http.ListResponse<Model.Contact> = yield call(getContacts, query, { cancelToken: source.token });
    yield put(responseContactsAction(response));
  } catch (e) {
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error retrieving the contacts.");
      yield put(responseContactsAction({ count: 0, data: [] }, { error: e }));
    }
  } finally {
    yield put(loadingContactsAction(false));
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
      yield put(deletingContactAction({ id: action.payload, value: true }));
      try {
        yield call(deleteContact, action.payload, { cancelToken: source.token });
        yield put(removeContactFromStateAction(action.payload));
      } catch (e) {
        if (!(yield cancelled())) {
          handleRequestError(e, "There was an error deleting the contact.");
        }
      } finally {
        yield put(deletingContactAction({ id: action.payload, value: false }));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }
}
