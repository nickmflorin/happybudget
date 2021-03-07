import { isNil, find, map, concat } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import {
  getAccounts,
  getAccountSubAccounts,
  getSubAccountSubAccounts,
  deleteAccount,
  updateAccount,
  createAccount,
  createAccountSubAccount,
  createSubAccountSubAccount,
  updateSubAccount,
  deleteSubAccount,
  getBudget,
  getAccount,
  getSubAccount
} from "services";
import { handleRequestError } from "store/tasks";
import {
  setAncestorsAction,
  setAncestorsLoadingAction,
  loadingBudgetAction,
  responseBudgetAction,
  loadingAccountAction,
  responseAccountAction,
  loadingSubAccountAction,
  responseSubAccountAction,
  loadingAccountsAction,
  loadingAccountSubAccountsAction,
  loadingSubAccountSubAccountsAction,
  responseAccountsAction,
  responseAccountSubAccountsAction,
  responseSubAccountSubAccountsAction,
  deletingAccountAction,
  deletingAccountSubAccountAction,
  deletingSubAccountSubAccountAction,
  creatingAccountAction,
  creatingAccountSubAccountAction,
  creatingSubAccountSubAccountAction,
  updatingAccountAction,
  updatingAccountSubAccountAction,
  updatingSubAccountSubAccountAction,
  setAccountsDataAction,
  setAccountSubAccountsDataAction,
  setSubAccountSubAccountsDataAction,
  updateAccountsRowInStateOnlyAction,
  updateAccountSubAccountsRowInStateOnlyAction,
  updateSubAccountSubAccountsRowInStateOnlyAction
} from "./actions";
import { initialAccountState, initialSubAccountState } from "./initialState";
import {
  subAccountPayloadFromRow,
  subAccountRowHasRequiredfields,
  accountPayloadFromRow,
  accountRowHasRequiredfields
} from "./util";

export function* handleAccountRowRemovalTask(action: Redux.Budget.IAction<Redux.Budget.IAccountRow>): SagaIterator {
  if (!isNil(action.payload)) {
    // NOTE: We cannot find the existing row from the table in state because the
    // row was already removed from the table rows via the reducer synchronously.
    if (action.payload.isPlaceholder === false) {
      yield put(deletingAccountAction({ id: action.payload.id as number, value: true }));
      try {
        yield call(deleteAccount, action.payload.id as number);
      } catch (e) {
        // TODO: Should we put the row back in if there was an error?
        handleRequestError(e, "There was an error deleting the account.");
      } finally {
        yield put(deletingAccountAction({ id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleAccountSubAccountRowRemovalTask(
  action: Redux.Budget.IAction<Redux.Budget.ISubAccountRow>
): SagaIterator {
  if (!isNil(action.payload) && !isNil(action.accountId)) {
    // NOTE: We cannot find the existing row from the table in state because the
    // row was already removed from the table rows via the reducer synchronously.
    if (action.payload.isPlaceholder === false) {
      yield put(deletingAccountSubAccountAction(action.accountId, { id: action.payload.id as number, value: true }));
      try {
        yield call(deleteSubAccount, action.payload.id as number);
      } catch (e) {
        // TODO: Should we put the row back in if there was an error?
        handleRequestError(e, "There was an error deleting the sub account.");
      } finally {
        yield put(deletingAccountSubAccountAction(action.accountId, { id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleSubAccountSubAccountRowRemovalTask(
  action: Redux.Budget.IAction<Redux.Budget.ISubAccountRow>
): SagaIterator {
  if (!isNil(action.payload) && !isNil(action.subaccountId)) {
    // NOTE: We cannot find the existing row from the table in state because the
    // row was already removed from the table rows via the reducer synchronously.
    if (action.payload.isPlaceholder === false) {
      yield put(
        deletingSubAccountSubAccountAction(action.subaccountId, { id: action.payload.id as number, value: true })
      );
      try {
        yield call(deleteSubAccount, action.payload.id as number);
      } catch (e) {
        // TODO: Should we put the row back in if there was an error?
        handleRequestError(e, "There was an error deleting the sub account.");
      } finally {
        yield put(
          deletingSubAccountSubAccountAction(action.subaccountId, { id: action.payload.id as number, value: false })
        );
      }
    }
  }
}

// TODO: Do we need both the ID and the payload here?  Can the ID from the payload
// be used?
export function* handleAccountRowUpdateTask(
  action: Redux.Budget.IAction<{ id: number; payload: Partial<Redux.Budget.IAccountRow> }>
): SagaIterator {
  if (
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.payload) &&
    !isNil(action.budgetId)
  ) {
    const table = yield select((state: Redux.IApplicationStore) => state.budget.accounts.table);

    // Here, the existing row will have already been updated by the reducer because
    // that runs synchronously.
    const existing: Redux.Budget.IAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating account in state...
        the account with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      const payload = accountPayloadFromRow(existing);
      if (existing.isPlaceholder === true) {
        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (accountRowHasRequiredfields(existing)) {
          yield put(creatingAccountAction(true));
          try {
            const response = yield call(createAccount, action.budgetId, payload);
            // NOTE: We have to call a specific action that will only trigger the state update
            // in the reducer, not the saga - this is because the saga will wind up triggering
            // this task and we need to prevent the recursion.
            yield put(
              updateAccountsRowInStateOnlyAction({
                id: existing.id,
                payload: { id: response.id, isPlaceholder: false }
              })
            );
          } catch (e) {
            // TODO: Should we revert the changes if there was an error?
            handleRequestError(e, "There was an error updating the account.");
          } finally {
            yield put(creatingAccountAction(false));
          }
        }
      } else {
        yield put(updatingAccountAction({ id: existing.id as number, value: true }));
        try {
          // The reducer has already handled updating the sub account in the state
          // synchronously before the time that this API request is made.
          yield call(updateAccount, existing.id as number, payload);
        } catch (e) {
          // TODO: Should we revert the changes if there was an error?
          handleRequestError(e, "There was an error updating the account.");
        } finally {
          yield put(updatingAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

// TODO: Do we need both the ID and the payload here?  Can the ID from the payload
// be used?
export function* handleAccountSubAccountRowUpdateTask(
  action: Redux.Budget.IAction<{ id: number; payload: Partial<Redux.Budget.ISubAccountRow> }>
): SagaIterator {
  if (
    !isNil(action.budgetId) &&
    !isNil(action.accountId) &&
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.payload)
  ) {
    const accountId = action.accountId;

    const table = yield select((state: Redux.IApplicationStore) => {
      let subState: Redux.Budget.IAccountStore = initialAccountState;
      if (!isNil(state.budget.accounts.details[accountId])) {
        subState = state.budget.accounts.details[accountId];
      }
      return subState.subaccounts.table;
    });

    // Here, the existing row will have already been updated by the reducer because
    // that runs synchronously.
    const existing: Redux.Budget.ISubAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      const payload = subAccountPayloadFromRow(existing);
      if (existing.isPlaceholder === true) {
        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (subAccountRowHasRequiredfields(existing)) {
          yield put(creatingAccountSubAccountAction(action.accountId, true));
          try {
            const response = yield call(createAccountSubAccount, action.accountId, action.budgetId, payload);
            // NOTE: We have to call a specific action that will only trigger the state update
            // in the reducer, not the saga - this is because the saga will wind up triggering
            // this task and we need to prevent the recursion.
            yield put(
              updateAccountSubAccountsRowInStateOnlyAction(action.accountId, {
                id: existing.id,
                payload: { id: response.id, isPlaceholder: false }
              })
            );
          } catch (e) {
            // TODO: Should we revert the changes if there was an error?
            handleRequestError(e, "There was an error updating the sub account.");
          } finally {
            yield put(creatingAccountSubAccountAction(action.accountId, false));
          }
        }
      } else {
        yield put(updatingAccountSubAccountAction(action.accountId, { id: existing.id as number, value: true }));
        try {
          // The reducer has already handled updating the sub account in the state
          // synchronously before the time that this API request is made.
          yield call(updateSubAccount, existing.id as number, payload);
        } catch (e) {
          // TODO: Should we revert the changes if there was an error?
          handleRequestError(e, "There was an error updating the sub account.");
        } finally {
          yield put(updatingAccountSubAccountAction(action.accountId, { id: existing.id as number, value: false }));
        }
      }
    }
  }
}

// TODO: Do we need both the ID and the payload here?  Can the ID from the payload
// be used?
export function* handleSubAccountSubAccountRowUpdateTask(
  action: Redux.Budget.IAction<{ id: number; payload: Partial<Redux.Budget.ISubAccountRow> }>
): SagaIterator {
  if (
    !isNil(action.subaccountId) &&
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.payload)
  ) {
    const subaccountId = action.subaccountId;

    const table = yield select((state: Redux.IApplicationStore) => {
      let subState: Redux.Budget.ISubAccountStore = initialSubAccountState;
      if (!isNil(state.budget.subaccounts[subaccountId])) {
        subState = state.budget.subaccounts[subaccountId];
      }
      return subState.subaccounts.table;
    });

    // Here, the existing row will have already been updated by the reducer because
    // that runs synchronously.
    const existing: Redux.Budget.ISubAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.isPlaceholder === true) {
        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (subAccountRowHasRequiredfields(existing)) {
          const payload = subAccountPayloadFromRow(existing);
          yield put(creatingSubAccountSubAccountAction(action.subaccountId, true));
          try {
            const response = yield call(createSubAccountSubAccount, action.subaccountId, payload);
            // NOTE: We have to call a specific action that will only trigger the state update
            // in the reducer, not the saga - this is because the saga will wind up triggering
            // this task and we need to prevent the recursion.
            yield put(
              updateSubAccountSubAccountsRowInStateOnlyAction(action.subaccountId, {
                id: existing.id,
                payload: { id: response.id, isPlaceholder: false }
              })
            );
          } catch (e) {
            // TODO: Should we revert the changes if there was an error?
            handleRequestError(e, "There was an error updating the sub account.");
          } finally {
            yield put(creatingSubAccountSubAccountAction(action.subaccountId, false));
          }
        }
      } else {
        const payload = subAccountPayloadFromRow(existing);
        yield put(updatingSubAccountSubAccountAction(action.subaccountId, { id: existing.id as number, value: true }));
        try {
          // The reducer has already handled updating the sub account in the state
          // synchronously before the time that this API request is made.
          yield call(updateSubAccount, existing.id as number, payload);
        } catch (e) {
          // TODO: Should we revert the changes if there was an error?
          handleRequestError(e, "There was an error updating the sub account.");
        } finally {
          yield put(
            updatingSubAccountSubAccountAction(action.subaccountId, { id: existing.id as number, value: false })
          );
        }
      }
    }
  }
}

export function* getAccountsTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.budgetId)) {
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getAccounts, action.budgetId, { no_pagination: true });
      yield put(responseAccountsAction(response));
      yield put(
        setAccountsDataAction(
          map(response.data, (account: IAccount) => {
            return { ...account, selected: false, isPlaceholder: false };
          })
        )
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
      yield put(setAccountsDataAction([]));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}

export function* getAccountSubAccountsTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.budgetId) && !isNil(action.accountId)) {
    yield put(loadingAccountSubAccountsAction(action.accountId, true));
    try {
      const response = yield call(getAccountSubAccounts, action.accountId, action.budgetId, { no_pagination: true });
      yield put(responseAccountSubAccountsAction(action.accountId, response));
      yield put(
        setAccountSubAccountsDataAction(
          action.accountId,
          map(response.data, (subaccount: ISubAccount) => {
            return { ...subaccount, selected: false, isPlaceholder: false };
          })
        )
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts.");
      yield put(responseAccountSubAccountsAction(action.accountId, { count: 0, data: [] }, { error: e }));
      yield put(setAccountSubAccountsDataAction(action.accountId, []));
    } finally {
      yield put(loadingAccountSubAccountsAction(action.accountId, false));
    }
  }
}

export function* getSubAccountSubAccountsTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.subaccountId)) {
    yield put(loadingSubAccountSubAccountsAction(action.subaccountId, true));
    try {
      const response = yield call(getSubAccountSubAccounts, action.subaccountId, { no_pagination: true });
      yield put(responseSubAccountSubAccountsAction(action.subaccountId, response));
      yield put(
        setSubAccountSubAccountsDataAction(
          action.subaccountId,
          map(response.data, (subaccount: ISubAccount) => {
            return { ...subaccount, selected: false, isPlaceholder: false };
          })
        )
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the subaccount's sub accounts.");
      yield put(responseSubAccountSubAccountsAction(action.subaccountId, { count: 0, data: [] }, { error: e }));
      yield put(setSubAccountSubAccountsDataAction(action.subaccountId, []));
    } finally {
      yield put(loadingSubAccountSubAccountsAction(action.subaccountId, false));
    }
  }
}

export function* getBudgetTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.budgetId)) {
    yield put(setAncestorsLoadingAction(true));
    yield put(loadingBudgetAction(true));
    try {
      const response: IBudget = yield call(getBudget, action.budgetId);
      yield put(responseBudgetAction(response));
      yield put(
        setAncestorsAction([
          {
            id: response.id,
            name: response.name,
            type: "budget"
          }
        ])
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget.");
      yield put(responseBudgetAction(undefined, { error: e }));
    } finally {
      yield put(setAncestorsLoadingAction(false));
      yield put(loadingBudgetAction(false));
    }
  }
}

export function* getAccountTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.accountId)) {
    yield put(loadingAccountAction(action.accountId, true));
    yield put(setAncestorsLoadingAction(true));
    try {
      const response: IAccount = yield call(getAccount, action.accountId);
      yield put(responseAccountAction(action.accountId, response));
      yield put(
        setAncestorsAction(
          concat(response.ancestors, [
            {
              id: response.id,
              name: response.account_number,
              type: "account"
            }
          ])
        )
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account.");
      yield put(responseAccountAction(action.accountId, undefined, { error: e }));
    } finally {
      yield put(loadingAccountAction(action.accountId, false));
      yield put(setAncestorsLoadingAction(false));
    }
  }
}

export function* getSubAccountTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.subaccountId)) {
    yield put(setAncestorsLoadingAction(true));
    yield put(loadingSubAccountAction(action.subaccountId, true));
    try {
      const response: ISubAccount = yield call(getSubAccount, action.subaccountId);
      yield put(responseSubAccountAction(action.subaccountId, response));
      yield put(
        setAncestorsAction(
          concat(response.ancestors, [
            {
              id: response.id,
              name: response.name,
              type: "subaccount"
            }
          ])
        )
      );
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account.");
      yield put(responseSubAccountAction(action.subaccountId, undefined, { error: e }));
    } finally {
      yield put(loadingSubAccountAction(action.subaccountId, false));
      yield put(setAncestorsLoadingAction(false));
    }
  }
}
