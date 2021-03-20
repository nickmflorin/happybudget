import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, find, concat } from "lodash";
import { handleRequestError } from "api";
import {
  getAccountSubAccounts,
  createAccountSubAccount,
  updateSubAccount,
  deleteSubAccount,
  getAccount,
  getAccountComments,
  createAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountSubAccountsHistory
} from "services";
import { handleTableErrors } from "store/tasks";
import { setAncestorsLoadingAction, setAncestorsAction } from "../../actions";
import {
  payloadFromResponse,
  postPayload,
  patchPayload,
  rowHasRequiredFields,
  requestWarrantsParentRefresh,
  payloadBeforeResponse
} from "../../util";
import {
  loadingAccountAction,
  responseAccountAction,
  loadingAccountSubAccountsAction,
  responseAccountSubAccountsAction,
  deletingAccountSubAccountAction,
  creatingAccountSubAccountAction,
  updatingAccountSubAccountAction,
  updateAccountSubAccountsTableRowAction,
  activateAccountSubAccountsTablePlaceholderAction,
  removeAccountSubAccountsTableRowAction,
  addErrorsToAccountSubAccountsTableAction,
  addAccountSubAccountsTablePlaceholdersAction,
  requestAccountSubAccountsAction,
  requestAccountAction,
  loadingAccountCommentsAction,
  responseAccountCommentsAction,
  submittingAccountCommentAction,
  addAccountCommentToStateAction,
  deletingAccountCommentAction,
  removeAccountCommentFromStateAction,
  updateAccountCommentInStateAction,
  editingAccountCommentAction,
  replyingToAccountCommentAction,
  loadingAccountSubAccountsHistoryAction,
  responseAccountSubAccountsHistoryAction
} from "../actions";

export function* getAccountSubAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId) && !isNil(budgetId)) {
    yield put(loadingAccountSubAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getAccountSubAccountsHistory, accountId, budgetId);
      yield put(responseAccountSubAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
    } finally {
      yield put(loadingAccountSubAccountsHistoryAction(false));
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

export function* handleAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountAction()), put(requestAccountSubAccountsAction())]);
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

export function* handleAccountSubAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(accountId) && !isNil(action.payload)) {
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
      const preResponsePayload = payloadBeforeResponse(action.payload, "subaccount");
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
        const requestPayload = postPayload<Table.ISubAccountRow>(existing, "subaccount");
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
        const requestPayload = patchPayload(action.payload, "subaccount") as Partial<Http.ISubAccountPayload>;
        try {
          console.log(requestPayload);
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
