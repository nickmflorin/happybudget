import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, find, concat, forEach } from "lodash";
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
  getSubAccount,
  getBudgetActuals,
  deleteActual,
  updateActual,
  createAccountActual,
  createSubAccountActual
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
  loadingActualsAction,
  responseAccountsAction,
  responseAccountSubAccountsAction,
  responseSubAccountSubAccountsAction,
  responseActualsAction,
  deletingAccountAction,
  deletingAccountSubAccountAction,
  deletingSubAccountSubAccountAction,
  creatingAccountAction,
  creatingAccountSubAccountAction,
  creatingSubAccountSubAccountAction,
  updatingAccountAction,
  updatingAccountSubAccountAction,
  updatingSubAccountSubAccountAction,
  updateAccountsTableRowAction,
  updateActualsTableCellAction,
  updateAccountSubAccountsTableRowAction,
  updateSubAccountSubAccountsTableRowAction,
  activateAccountSubAccountsTablePlaceholderAction,
  activateAccountsTablePlaceholderAction,
  activateSubAccountSubAccountsTablePlaceholderAction,
  activateActualsPlaceholderAction,
  removeAccountsTableRowAction,
  removeAccountSubAccountsRowAction,
  removeSubAccountSubAccountsTableRowAction,
  addErrorsToAccountsTableAction,
  addErrorsToAccountSubAccountsTableAction,
  addErrorsToSubAccountSubAccountsTableAction,
  addErrorsToActualsTableAction,
  addAccountSubAccountsTablePlaceholdersAction,
  addSubAccountSubAccountsTablePlaceholdersAction,
  addAccountsTablePlaceholdersAction,
  addActualsTablePlaceholdersAction,
  removeActualsTableRowAction,
  deletingActualAction,
  creatingActualAction,
  updatingActualAction,
  requestAccountsAction,
  requestAccountSubAccountsAction,
  requestSubAccountSubAccountsAction,
  requestBudgetAction,
  requestAccountAction,
  requestSubAccountAction
} from "./actions";
import {
  payloadFromResponse,
  postPayloadFromRow,
  rowHasRequiredFields,
  requestWarrantsParentRefresh,
  payloadBeforeResponse
} from "./util";

function* handleTableErrors(
  e: Error,
  message: string,
  id: number,
  action: (errors: Table.ICellError[]) => Redux.IAction<any>
): SagaIterator {
  if (e instanceof ClientError) {
    const cellErrors: Table.ICellError[] = [];
    forEach(e.errors, (errors: Http.IErrorDetail[], field: string) => {
      cellErrors.push({
        id: id,
        // TODO: We might want to build in a way to capture multiple errors for the cell.
        error: errors[0].message,
        // TODO: Should we make sure the field exists as a cell?  Instead of force
        // coercing here?
        field: field
      });
    });
    if (cellErrors.length === 0) {
      handleRequestError(e, message);
    } else {
      yield put(action(cellErrors));
    }
  } else {
    handleRequestError(e, message);
  }
}

export function* handleBudgetChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountsAction()), put(requestBudgetAction())]);
}

export function* handleAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountAction()), put(requestAccountSubAccountsAction())]);
}

export function* handleSubAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestSubAccountAction()), put(requestSubAccountSubAccountsAction())]);
}

export function* handleAccountRemovalTask(action: Redux.IAction<Table.IAccountRow>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(removeAccountsTableRowAction(action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
    if (action.payload.meta.isPlaceholder === false) {
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

export function* handleActualRemovalTask(action: Redux.IAction<Table.IActualRow>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(removeActualsTableRowAction(action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
    if (action.payload.meta.isPlaceholder === false) {
      yield put(deletingActualAction({ id: action.payload.id as number, value: true }));
      try {
        yield call(deleteActual, action.payload.id as number);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the actual.");
      } finally {
        yield put(deletingActualAction({ id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleAccountSubAccountRemovalTask(action: Redux.IAction<Table.ISubAccountRow>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(action.payload) && !isNil(accountId)) {
    yield put(removeAccountSubAccountsRowAction(accountId, action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
    if (action.payload.meta.isPlaceholder === false) {
      yield put(deletingAccountSubAccountAction({ id: action.payload.id as number, value: true }));
      try {
        yield call(deleteSubAccount, action.payload.id as number);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the sub account.");
      } finally {
        yield put(deletingAccountSubAccountAction({ id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleSubAccountSubAccountRemovalTask(action: Redux.IAction<Table.ISubAccountRow>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.budget.subaccount.id);
  if (!isNil(action.payload) && !isNil(subaccountId)) {
    yield put(removeSubAccountSubAccountsTableRowAction(subaccountId, action.payload));
    // NOTE: We cannot find the existing row from the table in state because the
    // dispatched action above will remove the row from the table.
    if (action.payload.meta.isPlaceholder === false) {
      yield put(deletingSubAccountSubAccountAction({ id: action.payload.id as number, value: true }));
      try {
        yield call(deleteSubAccount, action.payload.id as number);
      } catch (e) {
        handleRequestError(e, "There was an error deleting the sub account.");
      } finally {
        yield put(deletingSubAccountSubAccountAction({ id: action.payload.id as number, value: false }));
      }
    }
  }
}

export function* handleAccountUpdateTask(
  action: Redux.IAction<{ id: number; data: Partial<Table.IAccountRow> }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data) && !isNil(budgetId)) {
    const table = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.table.data);

    const existing: Table.IAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating account in state...
        the account with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      // There are some cases where we need to update the row in the table before
      // we make the request, to improve the UI.  This happens for cells where the
      // value is rendered via an HTML element (i.e. the Unit Cell).  AGGridReact will
      // not automatically update the cell when the Unit is changed via the dropdown,
      // so we need to udpate the row in the data used to populate the table.  We could
      // do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = payloadBeforeResponse<Table.IAccountRow>(action.payload.data, "subaccount");
      if (Object.keys(preResponsePayload).length !== 0) {
        yield put(
          updateAccountsTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        const payload = postPayloadFromRow<Table.IAccountRow, Http.IAccountPayload>(existing, "account");
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.IAccountRow>(existing, "account")) {
          yield put(creatingAccountAction(true));
          try {
            const response: IAccount = yield call(createAccount, budgetId, payload as Http.IAccountPayload);
            yield put(activateAccountsTablePlaceholderAction({ oldId: existing.id, id: response.id }));
            const responsePayload = payloadFromResponse<IAccount>(response, "account");
            yield put(updateAccountsTableRowAction({ id: response.id, data: responsePayload }));
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the account.",
              existing.id,
              (errors: Table.ICellError[]) => addErrorsToAccountsTableAction(errors)
            );
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
            action.payload.data as Partial<Http.IAccountPayload>
          );
          const responsePayload = payloadFromResponse<IAccount>(response, "account");
          yield put(updateAccountsTableRowAction({ id: response.id, data: responsePayload }));
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the account.",
            existing.id,
            (errors: Table.ICellError[]) => addErrorsToAccountsTableAction(errors)
          );
        } finally {
          yield put(updatingAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* handleActualUpdateTask(
  action: Redux.IAction<{ id: number; data: Partial<Table.IActualRow> }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data) && !isNil(budgetId)) {
    const table: Table.IActualRow[] = yield select((state: Redux.IApplicationStore) => state.budget.actuals.table.data);

    const existing: Table.IActualRow | undefined = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating actual in state...
        the actual with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      if (existing.meta.isPlaceholder === true) {
        const payload = postPayloadFromRow<Table.IActualRow, Http.IActualPayload>(existing, "actual");
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.IActualRow>(existing, "actual")) {
          yield put(creatingActualAction(true));
          // try {
          //   const response: IActual = yield call(createActual, action.budgetId, payload as Http.IAccountPayload);
          //   yield put(activateActualsPlaceholderAction({ oldId: existing.id, id: response.id }));
          //   const updates = convertActualResponseToCellUpdates(response);
          //   yield put(updateActualsCellAction(updates));
          // } catch (e) {
          //   // TODO: Should we revert the changes if there was an error?
          //   handleRequestError(e, "There was an error updating the actual.");
          // } finally {
          //   yield put(creatingActualAction(false));
          // }
        }
      } else {
        yield put(updatingActualAction({ id: existing.id as number, value: true }));
        try {
          const response: IActual = yield call(
            updateActual,
            existing.id as number,
            action.payload.data as Partial<Http.IActualPayload>
          );
          const responsePayload = payloadFromResponse<IActual>(response, "actual");
          yield put(updateActualsTableCellAction({ id: existing.id, data: responsePayload }));
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the actual.",
            existing.id,
            (errors: Table.ICellError[]) => addErrorsToActualsTableAction(errors)
          );
        } finally {
          yield put(updatingActualAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* handleAccountSubAccountUpdateTask(
  action: Redux.IAction<{ id: number; data: { [key in Table.SubAccountRowField]: any } }>
): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (
    !isNil(budgetId) &&
    !isNil(accountId) &&
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.data)
  ) {
    const id = action.payload.id;
    const table = yield select((state: Redux.IApplicationStore) => state.budget.account.subaccounts.table.data);

    const existing: Table.ISubAccountRow = find(table, { id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      // There are some cases where we need to update the row in the table before
      // we make the request, to improve the UI.  This happens for cells where the
      // value is rendered via an HTML element (i.e. the Unit Cell).  AGGridReact will
      // not automatically update the cell when the Unit is changed via the dropdown,
      // so we need to udpate the row in the data used to populate the table.  We could
      // do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = payloadBeforeResponse<Table.ISubAccountRow>(action.payload.data, "subaccount");
      if (Object.keys(preResponsePayload).length !== 0) {
        yield put(
          updateAccountSubAccountsTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        const requestPayload = postPayloadFromRow<Table.ISubAccountRow, Http.ISubAccountPayload>(
          existing,
          "subaccount"
        );
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.ISubAccountRow>(existing, "subaccount")) {
          yield put(creatingAccountSubAccountAction(true));
          try {
            const response: ISubAccount = yield call(
              createAccountSubAccount,
              accountId,
              budgetId,
              requestPayload as Http.ISubAccountPayload
            );
            yield put(activateAccountSubAccountsTablePlaceholderAction({ oldId: existing.id, id: response.id }));
            const responsePayload = payloadFromResponse<ISubAccount>(response, "subaccount");
            yield put(updateAccountSubAccountsTableRowAction({ id: existing.id, data: responsePayload }));
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the sub account.",
              existing.id,
              (errors: Table.ICellError[]) => addErrorsToAccountSubAccountsTableAction(errors)
            );
          } finally {
            yield put(creatingAccountSubAccountAction(false));
          }
        }
      } else {
        yield put(updatingAccountSubAccountAction({ id: existing.id as number, value: true }));
        const requestPayload = action.payload.data as Partial<Http.ISubAccountPayload>;
        try {
          const response: ISubAccount = yield call(updateSubAccount, existing.id as number, requestPayload);
          const responsePayload = payloadFromResponse<ISubAccount>(response, "subaccount");
          yield put(updateAccountSubAccountsTableRowAction({ id: existing.id, data: responsePayload }));

          // Determine if the parent account needs to be refreshed due to updates to the underlying
          // account fields that calculate the values of the parent account.
          if (requestWarrantsParentRefresh(requestPayload, "subaccount")) {
            yield put(requestAccountAction());
          }
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the sub account.",
            existing.id,
            (errors: Table.ICellError[]) => addErrorsToAccountSubAccountsTableAction(errors)
          );
        } finally {
          yield put(updatingAccountSubAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* handleSubAccountSubAccountUpdateTask(
  action: Redux.IAction<{ id: number; data: Partial<Table.ISubAccountRow> }>
): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data)) {
    const table = yield select((state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.table.data);

    const existing: Table.ISubAccountRow = find(table, { id: action.payload.id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      // There are some cases where we need to update the row in the table before
      // we make the request, to improve the UI.  This happens for cells where the
      // value is rendered via an HTML element (i.e. the Unit Cell).  AGGridReact will
      // not automatically update the cell when the Unit is changed via the dropdown,
      // so we need to udpate the row in the data used to populate the table.  We could
      // do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = payloadBeforeResponse<Table.ISubAccountRow>(action.payload.data, "subaccount");
      if (Object.keys(preResponsePayload).length !== 0) {
        yield put(
          updateSubAccountSubAccountsTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        const requestPayload = postPayloadFromRow<Table.ISubAccountRow, Http.ISubAccountPayload>(
          existing,
          "subaccount"
        );
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.ISubAccountRow>(existing, "subaccount")) {
          yield put(creatingSubAccountSubAccountAction(true));
          try {
            const response = yield call(
              createSubAccountSubAccount,
              subaccountId,
              requestPayload as Http.ISubAccountPayload
            );
            yield put(activateSubAccountSubAccountsTablePlaceholderAction({ oldId: existing.id, id: response.id }));
            const responsePayload = payloadFromResponse<ISubAccount>(response, "subaccount");
            yield put(updateSubAccountSubAccountsTableRowAction({ id: response.id, data: responsePayload }));
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the sub account.",
              existing.id,
              (errors: Table.ICellError[]) => addErrorsToSubAccountSubAccountsTableAction(errors)
            );
          } finally {
            yield put(creatingSubAccountSubAccountAction(false));
          }
        }
      } else {
        yield put(updatingSubAccountSubAccountAction({ id: existing.id as number, value: true }));
        const requestPayload = action.payload.data as Partial<Http.ISubAccountPayload>;
        try {
          const response: ISubAccount = yield call(updateSubAccount, existing.id, requestPayload);
          const responsePayload = payloadFromResponse<ISubAccount>(response, "subaccount");
          yield put(
            updateSubAccountSubAccountsTableRowAction({
              id: response.id,
              data: responsePayload
            })
          );
          // Determine if the parent account needs to be refreshed due to updates to the underlying
          // subaccount fields that calculate the values of the parent subaccount.
          if (requestWarrantsParentRefresh(requestPayload, "subaccount")) {
            yield put(requestSubAccountAction());
          }
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the sub account.",
            existing.id,
            (errors: Table.ICellError[]) => addErrorsToSubAccountSubAccountsTableAction(errors)
          );
        } finally {
          yield put(updatingSubAccountSubAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* getAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getAccounts, budgetId, { no_pagination: true });
      yield put(responseAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addAccountsTablePlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}

export function* getActualsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingActualsAction(true));
    try {
      const response = yield call(getBudgetActuals, budgetId, { no_pagination: true });
      yield put(responseActualsAction(response));
      if (response.data.length === 0) {
        yield put(addActualsTablePlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's actuals.");
      yield put(responseActualsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingActualsAction(false));
    }
  }
}

export function* getAccountSubAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(budgetId) && !isNil(accountId)) {
    yield put(loadingAccountSubAccountsAction(true));
    try {
      const response: Http.IListResponse<ISubAccount> = yield call(getAccountSubAccounts, accountId, budgetId, {
        no_pagination: true
      });
      yield put(responseAccountSubAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addAccountSubAccountsTablePlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts.");
      yield put(responseAccountSubAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountSubAccountsAction(false));
    }
  }
}

export function* getSubAccountSubAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    yield put(loadingSubAccountSubAccountsAction(true));
    try {
      const response = yield call(getSubAccountSubAccounts, subaccountId, { no_pagination: true });
      yield put(responseSubAccountSubAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addSubAccountSubAccountsTablePlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the subaccount's sub accounts.");
      yield put(responseSubAccountSubAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingSubAccountSubAccountsAction(false));
    }
  }
}

export function* getBudgetTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(setAncestorsLoadingAction(true));
    yield put(loadingBudgetAction(true));
    try {
      const response: IBudget = yield call(getBudget, budgetId);
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

export function* getAccountTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId)) {
    yield put(loadingAccountAction(true));
    yield put(setAncestorsLoadingAction(true));
    try {
      const response: IAccount = yield call(getAccount, accountId);
      yield put(responseAccountAction(response));
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
      yield put(responseAccountAction(undefined, { error: e }));
    } finally {
      yield put(loadingAccountAction(false));
      yield put(setAncestorsLoadingAction(false));
    }
  }
}

export function* getSubAccountTask(action: Redux.IAction<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    yield put(setAncestorsLoadingAction(true));
    yield put(loadingSubAccountAction(true));
    try {
      const response: ISubAccount = yield call(getSubAccount, subaccountId);
      yield put(responseSubAccountAction(response));
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
      yield put(responseSubAccountAction(undefined, { error: e }));
    } finally {
      yield put(loadingSubAccountAction(false));
      yield put(setAncestorsLoadingAction(false));
    }
  }
}
