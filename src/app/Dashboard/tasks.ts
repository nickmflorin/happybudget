import { isNil, includes } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import {
  getBudgets,
  getTemplates,
  deleteBudget,
  deleteTemplate,
  getContacts,
  deleteContact,
  updateContact,
  createContact
} from "api/services";
import { handleRequestError } from "api";
import {
  loadingBudgetsAction,
  loadingTemplatesAction,
  responseBudgetsAction,
  responseTemplatesAction,
  deletingBudgetAction,
  deletingTemplateAction,
  removeBudgetFromStateAction,
  removeTemplateFromStateAction,
  loadingContactsAction,
  responseContactsAction,
  deletingContactAction,
  creatingContactAction,
  updatingContactAction,
  removeContactFromStateAction,
  updateContactInStateAction,
  addContactToStateAction
} from "./actions";

export function* getBudgetsTask(action: Redux.Action<any>): SagaIterator {
  const query = yield select((state: Redux.ApplicationStore) => {
    return {
      search: state.dashboard.budgets.search,
      page_size: state.dashboard.budgets.pageSize,
      page: state.dashboard.budgets.page
    };
  });
  yield put(loadingBudgetsAction(true));
  try {
    const response: Http.ListResponse<Model.Budget> = yield call(getBudgets, query);
    yield put(responseBudgetsAction(response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the budgets.");
    yield put(responseBudgetsAction({ count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingBudgetsAction(false));
  }
}

export function* getTemplatesTask(action: Redux.Action<any>): SagaIterator {
  const query = yield select((state: Redux.ApplicationStore) => {
    return {
      search: state.dashboard.templates.search,
      page_size: state.dashboard.templates.pageSize,
      page: state.dashboard.templates.page
    };
  });
  yield put(loadingTemplatesAction(true));
  try {
    const response: Http.ListResponse<Model.Template> = yield call(getTemplates, query);
    yield put(responseTemplatesAction(response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the templates.");
    yield put(responseTemplatesAction({ count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingTemplatesAction(false));
  }
}

export function* deleteBudgetTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingBudgetAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted budget to the TRASH domain state?
      yield call(deleteBudget, action.payload);
      yield put(removeBudgetFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the budget.");
    } finally {
      yield put(deletingBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteTemplateTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingTemplateAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted template to the TRASH domain state?
      yield call(deleteTemplate, action.payload);
      yield put(removeTemplateFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the template.");
    } finally {
      yield put(deletingTemplateAction({ id: action.payload, value: false }));
    }
  }
}

export function* getContactsTask(action: Redux.Action<any>): SagaIterator {
  const query: Http.ListQuery = yield select((state: Redux.ApplicationStore) => {
    return {
      page: state.dashboard.contacts.page,
      page_size: state.dashboard.contacts.pageSize,
      search: state.dashboard.contacts.search
    };
  });
  yield put(loadingContactsAction(true));
  try {
    let response: Http.ListResponse<Model.Contact> = yield call(getContacts, query);
    yield put(responseContactsAction(response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the contacts.");
    yield put(responseContactsAction({ count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingContactsAction(false));
  }
}

export function* deleteContactTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const deleting = yield select((state: Redux.ApplicationStore) => state.dashboard.contacts.deleting);
    if (!includes(deleting, action.payload)) {
      yield put(deletingContactAction({ id: action.payload, value: true }));
      try {
        yield call(deleteContact, action.payload);
        yield put(removeContactFromStateAction(action.payload));
      } catch (e) {
        handleRequestError(e, "There was an error deleting the contact.");
      } finally {
        yield put(deletingContactAction({ id: action.payload, value: false }));
      }
    }
  }
}

// Not currently used, because the updateContact service is used directly in the
// modal for editing a contact, but we might use in the future.
export function* updateContactTask(action: Redux.Action<Redux.UpdateModelActionPayload<Model.Contact>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(updatingContactAction({ id, value: true }));
    try {
      const response: Model.Contact = yield call(updateContact, id, data as Partial<Http.ContactPayload>);
      yield put(updateContactInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the contact.");
    } finally {
      yield put(updatingContactAction({ id, value: false }));
    }
  }
}

// Not currently used, because the createContact service is used directly in the
// modal for creating a contact, but we might use in the future.
export function* createContactTask(action: Redux.Action<Http.ContactPayload>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(creatingContactAction(true));
    try {
      const response: Model.Contact = yield call(createContact, action.payload);
      yield put(addContactToStateAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error creating the contact.");
    } finally {
      yield put(creatingContactAction(false));
    }
  }
}
