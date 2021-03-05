import { isNil, find } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import {
  getAccounts,
  getAccountSubAccounts,
  deleteAccount,
  updateAccount,
  createAccount,
  deleteSubAccount,
  updateSubAccount
} from "services";
import { handleRequestError } from "store/tasks";
import {
  loadingAccountsAction,
  loadingAccountSubAccountsAction,
  responseAccountsAction,
  responseAccountSubAccountsAction,
  removeAccountFromStateAction,
  deletingAccountAction,
  updatingAccountAction,
  creatingAccountAction,
  accountRemovedAction,
  accountChangedAction,
  accountAddedAction,
  updateAccountInStateAction,
  addAccountToStateAction,
  deletingSubAccountAction,
  subaccountRemovedAction,
  subaccountChangedAction,
  updatingSubAccountAction,
  addSubAccountSubAccountToStateAction
} from "./actions";

// TODO: Build in Pagination with AGGrid.
export function* getAccountsTask(action: Redux.Budget.IAction<any>): SagaIterator {
  if (!isNil(action.budgetId)) {
    yield put(loadingAccountsAction(true));
    try {
      // TODO: Build in Pagination with AGGrid.
      const response = yield call(getAccounts, action.budgetId, { no_pagination: true });
      yield put(responseAccountsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}

// TODO: Build in Pagination with AGGrid.
export function* getAccountSubAccountsTask(action: Redux.Budget.IAction<any>): SagaIterator {
  if (!isNil(action.budgetId) && !isNil(action.accountId)) {
    yield put(loadingAccountSubAccountsAction(action.accountId, true));
    try {
      // TODO: Build in Pagination with AGGrid.
      const response = yield call(getAccountSubAccounts, action.accountId, action.budgetId, { no_pagination: true });
      yield put(responseAccountSubAccountsAction(action.accountId, response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts.");
      yield put(responseAccountSubAccountsAction(action.accountId, { count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountSubAccountsAction(action.accountId, false));
    }
  }
}

export function* removeAccountFromStateTask(action: Redux.Budget.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: The reducer handles the removal of the account from the details state if it exists.
    const accounts = yield select((state: Redux.IApplicationStore) => state.budget.accounts.list);
    const existing = find(accounts, { id: action.payload });
    if (!isNil(existing)) {
      yield put(removeAccountFromStateAction(action.payload));
    }
  }
}

export function* updateAccountInStateTask(action: Redux.Budget.IAction<IAccount>): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: The reducer handles the updating of the account from the details state if it exists.
    const accounts = yield select((state: Redux.IApplicationStore) => state.budget.accounts.list);
    const existing = find(accounts, { id: action.payload });
    if (!isNil(existing)) {
      yield put(updateAccountInStateAction(action.payload));
    }
  }
}

export function* addAccountToStateTask(action: Redux.Budget.IAction<IAccount>): SagaIterator {
  // NOTE: Currently, there is no action to add the account to the set of account
  // details - but we might want to incorporate that down the line.
  if (!isNil(action.payload)) {
    yield put(addAccountToStateAction(action.payload));
  }
}

export function* deleteAccountTask(action: Redux.Budget.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingAccountAction({ id: action.payload, value: true }));
    try {
      yield call(deleteAccount, action.payload);
      yield put(accountRemovedAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the account.");
    } finally {
      yield put(deletingAccountAction({ id: action.payload, value: false }));
    }
  }
}

export function* updateAccountTask(action: Redux.Budget.IAction<Partial<Http.IAccountPayload>>): SagaIterator {
  if (!isNil(action.accountId) && !isNil(action.payload)) {
    yield put(updatingAccountAction({ id: action.accountId, value: true }));
    try {
      const response: IAccount = yield call(updateAccount, action.accountId, action.payload);
      yield put(accountChangedAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error updating the account.");
    } finally {
      yield put(updatingAccountAction({ id: action.accountId, value: false }));
    }
  }
}

export function* createAccountTask(action: Redux.Budget.IAction<Http.IAccountPayload>): SagaIterator {
  if (!isNil(action.budgetId) && !isNil(action.payload)) {
    yield put(creatingAccountAction(true));
    try {
      const response: IAccount = yield call(createAccount, action.budgetId, action.payload);
      yield put(accountAddedAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error creating the account.");
    } finally {
      yield put(creatingAccountAction(false));
    }
  }
}

export function* removeSubAccountFromStateTask(action: Redux.Budget.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: The reducer handles the removal of the account from the details state if it exists.
    const accounts = yield select((state: Redux.IApplicationStore) => state.budget.accounts.list);
    const existing = find(accounts, { id: action.payload });
    if (!isNil(existing)) {
      yield put(removeAccountFromStateAction(action.payload));
    }
  }
}

export function* updateSubAccountInStateTask(action: Redux.Budget.IAction<IAccount>): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: The reducer handles the updating of the account from the details state if it exists.
    const accounts = yield select((state: Redux.IApplicationStore) => state.budget.accounts.list);
    const existing = find(accounts, { id: action.payload });
    if (!isNil(existing)) {
      yield put(updateAccountInStateAction(action.payload));
    }
  }
}

export function* addSubAccountToStateTask(action: Redux.Budget.IAction<ISubAccount>): SagaIterator {
  // NOTE: Currently, there is no action to add the account to the set of account
  // details - but we might want to incorporate that down the line.
  // We need to figure out what the subaccountID is and if we are adding the sub
  // account to an account or the sub account.
  // if (!isNil(action.payload)) {
  //   yield put(addSubAccountSubAccountToStateAction(action.payload));
  // }
}

export function* deleteSubAccountTask(action: Redux.Budget.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingSubAccountAction({ id: action.payload, value: true }));
    try {
      yield call(deleteSubAccount, action.payload);
      yield put(subaccountRemovedAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the sub account.");
    } finally {
      yield put(deletingSubAccountAction({ id: action.payload, value: false }));
    }
  }
}

export function* updateSubAccountTask(action: Redux.Budget.IAction<Partial<Http.ISubAccountPayload>>): SagaIterator {
  if (!isNil(action.subaccountId) && !isNil(action.payload)) {
    yield put(updatingSubAccountAction({ id: action.subaccountId, value: true }));
    try {
      const response: ISubAccount = yield call(updateSubAccount, action.subaccountId, action.payload);
      yield put(subaccountChangedAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error updating the sub account.");
    } finally {
      yield put(updatingSubAccountAction({ id: action.subaccountId, value: false }));
    }
  }
}

// export function* createAccountTask(action: Redux.Budget.IAction<Http.IAccountPayload>): SagaIterator {
//   if (!isNil(action.budgetId) && !isNil(action.payload)) {
//     yield put(creatingAccountAction(true));
//     try {
//       const response: IAccount = yield call(createAccount, action.budgetId, action.payload);
//       yield put(accountAddedAction(response));
//     } catch (e) {
//       handleRequestError(e, "There was an error creating the account.");
//     } finally {
//       yield put(creatingAccountAction(false));
//     }
//   }
// }
