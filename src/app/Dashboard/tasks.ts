import { isNil, includes } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import {
  getBudgets,
  getBudgetsInTrash,
  deleteBudget,
  restoreBudget,
  permanentlyDeleteBudget,
  getContacts,
  deleteContact,
  updateContact,
  createContact
} from "services";
import { handleRequestError } from "api";
import {
  ActionDomains,
  loadingBudgetsAction,
  responseBudgetsAction,
  deletingBudgetAction,
  removeBudgetFromStateAction,
  restoringBudgetAction,
  permanentlyDeletingBudgetAction,
  loadingContactsAction,
  responseContactsAction,
  deletingContactAction,
  creatingContactAction,
  updatingContactAction,
  removeContactFromStateAction,
  updateContactInStateAction,
  addContactToStateAction
} from "./actions";

export function* getBudgetsTask(action: Redux.Dashboard.IAction<any>): SagaIterator {
  const query = yield select((state: Redux.IApplicationStore) => {
    if (action.domain === ActionDomains.ACTIVE) {
      return {
        search: state.dashboard.budgets.active.search,
        page_size: state.dashboard.budgets.active.pageSize,
        page: state.dashboard.budgets.active.page
      };
    }
    return {
      search: state.dashboard.budgets.trash.search,
      page_size: state.dashboard.budgets.trash.pageSize,
      page: state.dashboard.budgets.trash.page
    };
  });
  yield put(loadingBudgetsAction(action.domain, true));
  try {
    let response: Http.IListResponse<IBudget>;
    if (action.domain === ActionDomains.ACTIVE) {
      response = yield call(getBudgets, query);
    } else {
      response = yield call(getBudgetsInTrash, query);
    }
    yield put(responseBudgetsAction(action.domain, response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the budgets.");
    yield put(responseBudgetsAction(action.domain, { count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingBudgetsAction(action.domain, false));
  }
}

export function* deleteBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingBudgetAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted budget to the TRASh domain state?
      yield call(deleteBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.ACTIVE, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the budget.");
    } finally {
      yield put(deletingBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* restoreBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(restoringBudgetAction({ id: action.payload, value: true }));
    try {
      // TODO: Do we also want to add the deleted budget to the ACTIVE domain state?
      yield call(restoreBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.TRASH, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error restoring the budget.");
    } finally {
      yield put(restoringBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* permanentlyDeleteBudgetTask(action: Redux.Dashboard.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(permanentlyDeletingBudgetAction({ id: action.payload, value: true }));
    try {
      yield call(permanentlyDeleteBudget, action.payload);
      yield put(removeBudgetFromStateAction(ActionDomains.TRASH, action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the budget.");
    } finally {
      yield put(permanentlyDeletingBudgetAction({ id: action.payload, value: false }));
    }
  }
}

export function* getContactsTask(action: Redux.IAction<any>): SagaIterator {
  const query: Http.IListQuery = yield select((state: Redux.IApplicationStore) => {
    return {
      page: state.dashboard.contacts.page,
      page_size: state.dashboard.contacts.pageSize,
      search: state.dashboard.contacts.search
    };
  });
  yield put(loadingContactsAction(true));
  try {
    let response: Http.IListResponse<IContact> = yield call(getContacts, query);
    yield put(responseContactsAction(response));
  } catch (e) {
    handleRequestError(e, "There was an error retrieving the contacts.");
    yield put(responseContactsAction({ count: 0, data: [] }, { error: e }));
  } finally {
    yield put(loadingContactsAction(false));
  }
}

export function* deleteContactTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const deleting = yield select((state: Redux.IApplicationStore) => state.dashboard.contacts.deleting);
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
export function* updateContactTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IContact>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(updatingContactAction({ id, value: true }));
    try {
      const response: IContact = yield call(updateContact, id, data);
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
export function* createContactTask(action: Redux.IAction<Http.IContactPayload>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(creatingContactAction(true));
    try {
      const response: IContact = yield call(createContact, action.payload);
      yield put(addContactToStateAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error creating the contact.");
    } finally {
      yield put(creatingContactAction(false));
    }
  }
}
