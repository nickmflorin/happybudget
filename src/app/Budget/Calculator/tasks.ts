import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, find, concat } from "lodash";
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
  getAccount,
  getSubAccount,
  getBudgetComments,
  getAccountComments,
  getSubAccountComments,
  createBudgetComment,
  createAccountComment,
  createSubAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountsHistory,
  getAccountSubAccountsHistory,
  getSubAccountSubAccountsHistory
} from "services";
import { handleRequestError, handleTableErrors } from "store/tasks";
import { setAncestorsLoadingAction, setAncestorsAction } from "../actions";
import {
  payloadFromResponse,
  postPayloadFromRow,
  rowHasRequiredFields,
  requestWarrantsParentRefresh,
  payloadBeforeResponse
} from "../util";
import {
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
  updateAccountsTableRowAction,
  updateAccountSubAccountsTableRowAction,
  updateSubAccountSubAccountsTableRowAction,
  activateAccountSubAccountsTablePlaceholderAction,
  activateAccountsTablePlaceholderAction,
  activateSubAccountSubAccountsTablePlaceholderAction,
  removeAccountsTableRowAction,
  removeAccountSubAccountsTableRowAction,
  removeSubAccountSubAccountsTableRowAction,
  addErrorsToAccountsTableAction,
  addErrorsToAccountSubAccountsTableAction,
  addErrorsToSubAccountSubAccountsTableAction,
  addAccountSubAccountsTablePlaceholdersAction,
  addSubAccountSubAccountsTablePlaceholdersAction,
  addAccountsTablePlaceholdersAction,
  requestAccountSubAccountsAction,
  requestSubAccountSubAccountsAction,
  requestAccountAction,
  requestSubAccountAction,
  loadingBudgetCommentsAction,
  responseBudgetCommentsAction,
  loadingAccountCommentsAction,
  responseAccountCommentsAction,
  loadingSubAccountCommentsAction,
  responseSubAccountCommentsAction,
  submittingBudgetCommentAction,
  addBudgetCommentToStateAction,
  submittingAccountCommentAction,
  addAccountCommentToStateAction,
  submittingSubAccountCommentAction,
  addSubAccountCommentToStateAction,
  deletingBudgetCommentAction,
  deletingAccountCommentAction,
  deletingSubAccountCommentAction,
  removeBudgetCommentFromStateAction,
  removeAccountCommentFromStateAction,
  removeSubAccountCommentFromStateAction,
  updateBudgetCommentInStateAction,
  updateAccountCommentInStateAction,
  updateSubAccountCommentInStateAction,
  editingBudgetCommentAction,
  editingAccountCommentAction,
  editingSubAccountCommentAction,
  replyingToBudgetCommentAction,
  replyingToAccountCommentAction,
  replyingToSubAccountCommentAction,
  loadingAccountsHistoryAction,
  responseAccountsHistoryAction,
  loadingAccountSubAccountsHistoryAction,
  responseAccountSubAccountsHistoryAction,
  loadingSubAccountSubAccountsHistoryAction,
  responseSubAccountSubAccountsHistoryAction
} from "./actions";

export function* getSubAccountSubAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId)) {
    yield put(loadingSubAccountSubAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<IFieldAlterationEvent> = yield call(
        getSubAccountSubAccountsHistory,
        subaccountId
      );
      yield put(responseSubAccountSubAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the sub account's sub accounts history.");
    } finally {
      yield put(loadingSubAccountSubAccountsHistoryAction(false));
    }
  }
}

export function* getAccountSubAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId) && !isNil(budgetId)) {
    yield put(loadingAccountSubAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<IFieldAlterationEvent> = yield call(
        getAccountSubAccountsHistory,
        accountId,
        budgetId
      );
      yield put(responseAccountSubAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
    } finally {
      yield put(loadingAccountSubAccountsHistoryAction(false));
    }
  }
}

export function* getAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<IFieldAlterationEvent> = yield call(getAccountsHistory, budgetId);
      yield put(responseAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the accounts history.");
    } finally {
      yield put(loadingAccountsHistoryAction(false));
    }
  }
}

export function* submitBudgetCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToBudgetCommentAction({ id: parent, value: true }));
    } else {
      yield put(submittingBudgetCommentAction(true));
    }
    try {
      let response: IComment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text);
      } else {
        response = yield call(createBudgetComment, budgetId, data);
      }
      yield put(addBudgetCommentToStateAction({ data: response, parent }));
    } catch (e) {
      handleRequestError(e, "There was an error submitting the comment.");
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToBudgetCommentAction({ id: parent, value: false }));
      } else {
        yield put(submittingBudgetCommentAction(false));
      }
    }
  }
}

export function* deleteBudgetCommentTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingBudgetCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload);
      yield put(removeBudgetCommentFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the comment.");
    } finally {
      yield put(deletingBudgetCommentAction({ id: action.payload, value: false }));
    }
  }
}

export function* editBudgetCommentTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(editingBudgetCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateBudgetCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(editingBudgetCommentAction({ id, value: false }));
    }
  }
}

export function* getBudgetCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingBudgetCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getBudgetComments, budgetId);
      yield put(responseBudgetCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's comments.");
      yield put(responseBudgetCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingBudgetCommentsAction(false));
    }
  }
}

export function* submitAccountCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToAccountCommentAction({ id: parent, value: true }));
    } else {
      yield put(submittingAccountCommentAction(true));
    }
    try {
      let response: IComment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text);
      } else {
        response = yield call(createAccountComment, accountId, data);
      }
      yield put(addAccountCommentToStateAction({ data: response, parent }));
    } catch (e) {
      handleRequestError(e, "There was an error submitting the comment.");
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToAccountCommentAction({ id: parent, value: false }));
      } else {
        yield put(submittingAccountCommentAction(false));
      }
    }
  }
}

export function* deleteAccountCommentTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingAccountCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload);
      yield put(removeAccountCommentFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the comment.");
    } finally {
      yield put(deletingAccountCommentAction({ id: action.payload, value: false }));
    }
  }
}

export function* editAccountCommentTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(editingAccountCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateAccountCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(editingAccountCommentAction({ id, value: false }));
    }
  }
}

export function* getAccountCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId)) {
    yield put(loadingAccountCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getAccountComments, accountId);
      yield put(responseAccountCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's comments.");
      yield put(responseAccountCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountCommentsAction(false));
    }
  }
}

export function* submitSubAccountCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToSubAccountCommentAction({ id: parent, value: true }));
    } else {
      yield put(submittingSubAccountCommentAction(true));
    }
    try {
      let response: IComment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text);
      } else {
        response = yield call(createSubAccountComment, subaccountId, data);
      }
      yield put(addSubAccountCommentToStateAction({ data: response, parent }));
    } catch (e) {
      handleRequestError(e, "There was an error submitting the comment.");
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToSubAccountCommentAction({ id: parent, value: false }));
      } else {
        yield put(submittingSubAccountCommentAction(false));
      }
    }
  }
}

export function* deleteSubAccountCommentTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingSubAccountCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload);
      yield put(removeSubAccountCommentFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the comment.");
    } finally {
      yield put(deletingSubAccountCommentAction({ id: action.payload, value: false }));
    }
  }
}

export function* editSubAccountCommentTask(
  action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>
): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(editingSubAccountCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateSubAccountCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(editingSubAccountCommentAction({ id, value: false }));
    }
  }
}

export function* getSubAccountCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId)) {
    yield put(loadingSubAccountCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getSubAccountComments, subaccountId);
      yield put(responseSubAccountCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the subaccount's comments.");
      yield put(responseSubAccountCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingSubAccountCommentsAction(false));
    }
  }
}

export function* handleAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountAction()), put(requestAccountSubAccountsAction())]);
}

export function* handleSubAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestSubAccountAction()), put(requestSubAccountSubAccountsAction())]);
}

export function* handleAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const tableData: Table.IAccountRow[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.accounts.table.data
    );
    const existing: Table.IAccountRow | undefined = find(tableData, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.warn(
        `Inconsistent State!  Inconsistent state noticed when removing an account...
        The account with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else {
      // Dispatch the action to remove the row from the table in the UI.
      yield put(removeAccountsTableRowAction(action.payload));
      // Only make an API request to the server to delete the sub account if the
      // row was not a placeholder (i.e. the sub account exists in the backend).
      if (existing.meta.isPlaceholder === false) {
        yield put(deletingAccountAction({ id: action.payload, value: true }));
        try {
          yield call(deleteAccount, action.payload);
        } catch (e) {
          // TODO: Should we put the row back in if there was an error?
          handleRequestError(e, "There was an error deleting the account.");
        } finally {
          yield put(deletingAccountAction({ id: action.payload, value: false }));
        }
      }
    }
  }
}

export function* handleAccountSubAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(action.payload) && !isNil(accountId)) {
    const tableData: Table.ISubAccountRow[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.data
    );
    const existing: Table.ISubAccountRow | undefined = find(tableData, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.warn(
        `Inconsistent State!  Inconsistent state noticed when removing an account's sub account...
        The sub account with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else {
      // Dispatch the action to remove the row from the table in the UI.
      yield put(removeAccountSubAccountsTableRowAction(action.payload));
      // Only make an API request to the server to delete the sub account if the
      // row was not a placeholder (i.e. the sub account exists in the backend).
      if (existing.meta.isPlaceholder === false) {
        yield put(deletingAccountSubAccountAction({ id: action.payload, value: true }));
        try {
          yield call(deleteSubAccount, action.payload);
        } catch (e) {
          handleRequestError(e, "There was an error deleting the sub account.");
        } finally {
          yield put(deletingAccountSubAccountAction({ id: action.payload, value: false }));
        }
      }
    }
  }
}

export function* handleSubAccountSubAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(action.payload) && !isNil(subaccountId)) {
    const tableData: Table.ISubAccountRow[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.data
    );
    const existing: Table.ISubAccountRow | undefined = find(tableData, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.warn(
        `Inconsistent State!  Inconsistent state noticed when removing a sub account's sub account...
        The sub account with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else {
      // Dispatch the action to remove the row from the table in the UI.
      yield put(removeSubAccountSubAccountsTableRowAction(action.payload));
      // Only make an API request to the server to delete the sub account if the
      // row was not a placeholder (i.e. the sub account exists in the backend).
      if (existing.meta.isPlaceholder === false) {
        yield put(deletingSubAccountSubAccountAction({ id: action.payload, value: true }));
        try {
          yield call(deleteSubAccount, action.payload);
        } catch (e) {
          handleRequestError(e, "There was an error deleting the sub account.");
        } finally {
          yield put(deletingSubAccountSubAccountAction({ id: action.payload, value: false }));
        }
      }
    }
  }
}

export function* handleAccountUpdateTask(
  action: Redux.IAction<{ id: number; data: Partial<Table.IAccountRow> }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data) && !isNil(budgetId)) {
    const table = yield select((state: Redux.IApplicationStore) => state.calculator.accounts.table.data);

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
        // TODO: Should we be using the payload data here?  Instead of the existing row?
        // Or we should probably merge them, right?
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

export function* handleAccountSubAccountUpdateTask(
  action: Redux.IAction<{ id: number; data: { [key in Table.SubAccountRowField]: any } }>
): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (
    !isNil(budgetId) &&
    !isNil(accountId) &&
    !isNil(action.payload) &&
    !isNil(action.payload.id) &&
    !isNil(action.payload.data)
  ) {
    const id = action.payload.id;
    const table = yield select((state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table.data);

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
        // TODO: Should we be using the payload data here?  Instead of the existing row?
        // Or we should probably merge them, right?
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
            yield put(updateAccountSubAccountsTableRowAction({ id: response.id, data: responsePayload }));
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
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload) && !isNil(action.payload.id) && !isNil(action.payload.data)) {
    const table = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.data);

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
        // TODO: Should we be using the payload data here?  Instead of the existing row?
        // Or we should probably merge them, right?
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

export function* getAccountSubAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
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
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
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

export function* getAccountTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
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
              identifier: response.identifier,
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
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
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
              identifier: response.identifier,
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
