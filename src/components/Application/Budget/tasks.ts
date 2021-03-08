import { isNil, find, concat, forEach } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { ClientError } from "api";
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
  updateAccountsRowAction,
  updateAccountSubAccountsRowAction,
  updateSubAccountSubAccountsRowAction,
  removeAccountsRowAction,
  removeAccountSubAccountsRowAction,
  removeSubAccountSubAccountsRowAction,
  setAccountsTableCellError,
  addAccountSubAccountsPlaceholdersAction,
  addSubAccountSubAccountsPlaceholdersAction,
  addAccountsPlaceholdersAction
} from "./actions";
import { initialAccountState, initialSubAccountState } from "./initialState";
import {
  subAccountPayloadFromRow,
  subAccountRowHasRequiredfields,
  accountPayloadFromRow,
  accountRowHasRequiredfields,
  convertSubAccountToRow,
  convertAccountToRow
} from "./util";

export function* handleAccountRemovalTask(action: Redux.Budget.IAction<Redux.Budget.IAccountRow>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(removeAccountsRowAction(action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
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

export function* handleAccountSubAccountRemovalTask(
  action: Redux.Budget.IAction<Redux.Budget.ISubAccountRow>
): SagaIterator {
  if (!isNil(action.payload) && !isNil(action.accountId)) {
    yield put(removeAccountSubAccountsRowAction(action.accountId, action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
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

export function* handleSubAccountSubAccountRemovalTask(
  action: Redux.Budget.IAction<Redux.Budget.ISubAccountRow>
): SagaIterator {
  if (!isNil(action.payload) && !isNil(action.subaccountId)) {
    yield put(removeSubAccountSubAccountsRowAction(action.subaccountId, action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
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

export function* handleAccountUpdateTask(
  action: Redux.Budget.IAction<{ id: number; payload: Partial<Redux.Budget.IAccountRow> }>
): SagaIterator {
  if (
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.payload) &&
    !isNil(action.budgetId)
  ) {
    const table = yield select((state: Redux.IApplicationStore) => state.budget.accounts.table.data);

    const existing: Redux.Budget.IAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating account in state...
        the account with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.isPlaceholder === true) {
        // The reducer will have already updated the existing value of the row
        // synchronously.
        const payload = accountPayloadFromRow(existing);
        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (accountRowHasRequiredfields(existing)) {
          yield put(creatingAccountAction(true));
          try {
            const response: IAccount = yield call(createAccount, action.budgetId, payload as Http.IAccountPayload);
            yield put(
              updateAccountsRowAction({
                id: existing.id,
                payload: convertAccountToRow(response, existing, { isPlaceholder: false, selected: false })
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
          const response: IAccount = yield call(
            updateAccount,
            existing.id as number,
            action.payload.payload as Partial<Http.IAccountPayload>
          );
          yield put(
            updateAccountsRowAction({
              id: existing.id,
              payload: convertAccountToRow(response, existing, { isPlaceholder: false, selected: false })
            })
          );
        } catch (e) {
          if (e instanceof ClientError) {
            const cellErrors: Redux.Budget.AccountCellError[] = [];
            forEach(e.errors, (errors: Http.IErrorDetail[], field: string) => {
              cellErrors.push({
                id: existing.id,
                // TODO: We might want to build in a way to capture multiple errors for the cell.
                error: errors[0].message,
                // TODO: Should we make sure the field exists as a cell?  Instead of force
                // coercing here?
                field: field as Redux.Budget.AccountRowField
              });
            });
            if (cellErrors.length === 0) {
              handleRequestError(e, "There was an error updating the account.");
            } else {
              yield put(setAccountsTableCellError(cellErrors));
            }
          } else {
            handleRequestError(e, "There was an error updating the account.");
          }
        } finally {
          yield put(updatingAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* handleAccountSubAccountUpdateTask(
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
      return subState.subaccounts.table.data;
    });

    const existing: Redux.Budget.ISubAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.isPlaceholder === true) {
        // The reducer will have already updated the existing value of the row
        // synchronously.
        const payload = subAccountPayloadFromRow(existing);

        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (subAccountRowHasRequiredfields(existing)) {
          yield put(creatingAccountSubAccountAction(action.accountId, true));
          try {
            const response: ISubAccount = yield call(
              createAccountSubAccount,
              action.accountId,
              action.budgetId,
              payload as Http.ISubAccountPayload
            );
            yield put(
              updateAccountSubAccountsRowAction(action.accountId, {
                id: existing.id,
                payload: convertSubAccountToRow(response, existing, { isPlaceholder: false, selected: false })
              })
            );
          } catch (e) {
            // TODO: Should we revert the changes if there was an error?
            handleRequestError(e, "There was an error updating the sub account.");
          } finally {
            yield put(creatingAccountSubAccountAction(action.accountId, false));
          }
        } else {
          // TODO: Is it worth always updating the row, and doing so before any
          // potential API request, so that non-text changes to the tables happen
          // more snappy?
          yield put(
            updateAccountSubAccountsRowAction(action.accountId, {
              id: existing.id,
              payload: action.payload.payload
            })
          );
        }
      } else {
        console.log("EXISTING");
        console.log(existing);
        yield put(updatingAccountSubAccountAction(action.accountId, { id: existing.id as number, value: true }));
        try {
          // The reducer has already handled updating the sub account in the state
          // synchronously before the time that this API request is made.
          const response: ISubAccount = yield call(
            updateSubAccount,
            existing.id as number,
            action.payload.payload as Partial<Http.ISubAccountPayload>
          );
          const p = convertSubAccountToRow(response, existing, { isPlaceholder: false });
          console.log(p);
          yield put(
            updateAccountSubAccountsRowAction(action.accountId, {
              id: existing.id,
              payload: p
            })
          );
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

export function* handleSubAccountSubAccountUpdateTask(
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
      return subState.subaccounts.table.data;
    });

    const existing: Redux.Budget.ISubAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.isPlaceholder === true) {
        // The reducer will have already updated the existing value of the row
        // synchronously.
        const payload = subAccountPayloadFromRow(existing);
        // Wait until all of the required fields are present before we create
        // the SubAccount in the backend and remove the placeholder designation
        // of the row in the frontend.
        if (subAccountRowHasRequiredfields(existing)) {
          yield put(creatingSubAccountSubAccountAction(action.subaccountId, true));
          try {
            const response = yield call(
              createSubAccountSubAccount,
              action.subaccountId,
              payload as Http.ISubAccountPayload
            );
            yield put(
              updateSubAccountSubAccountsRowAction(action.subaccountId, {
                id: existing.id,
                payload: convertSubAccountToRow(response, existing, { isPlaceholder: false })
              })
            );
          } catch (e) {
            // TODO: Should we revert the changes if there was an error?
            handleRequestError(e, "There was an error updating the sub account.");
          } finally {
            yield put(creatingSubAccountSubAccountAction(action.subaccountId, false));
          }
        } else {
          // TODO: Is it worth always updating the row, and doing so before any
          // potential API request, so that non-text changes to the tables happen
          // more snappy?
          yield put(
            updateSubAccountSubAccountsRowAction(action.subaccountId, {
              id: existing.id,
              payload: action.payload.payload
            })
          );
        }
      } else {
        const payload = subAccountPayloadFromRow(existing);
        yield put(updatingSubAccountSubAccountAction(action.subaccountId, { id: existing.id as number, value: true }));
        try {
          // The reducer has already handled updating the sub account in the state
          // synchronously before the time that this API request is made.
          const response: ISubAccount = yield call(updateSubAccount, existing.id as number, payload);
          yield put(
            updateSubAccountSubAccountsRowAction(action.subaccountId, {
              id: existing.id,
              payload: convertSubAccountToRow(response, existing, { isPlaceholder: false })
            })
          );
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
      if (response.data.length === 2) {
        yield put(addAccountsPlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}

export function* getAccountSubAccountsTask(action: Redux.Budget.IAction<null>): SagaIterator {
  if (!isNil(action.budgetId) && !isNil(action.accountId)) {
    yield put(loadingAccountSubAccountsAction(action.accountId, true));
    try {
      const response: Http.IListResponse<ISubAccount> = yield call(
        getAccountSubAccounts,
        action.accountId,
        action.budgetId,
        { no_pagination: true }
      );
      yield put(responseAccountSubAccountsAction(action.accountId, response));
      if (response.data.length === 0) {
        yield put(addAccountSubAccountsPlaceholdersAction(action.accountId, 2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts.");
      yield put(responseAccountSubAccountsAction(action.accountId, { count: 0, data: [] }, { error: e }));
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
      if (response.data.length === 0) {
        yield put(addSubAccountSubAccountsPlaceholdersAction(action.subaccountId, 2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the subaccount's sub accounts.");
      yield put(responseSubAccountSubAccountsAction(action.subaccountId, { count: 0, data: [] }, { error: e }));
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
