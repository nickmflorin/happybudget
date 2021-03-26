import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, find, concat, map, reduce } from "lodash";
import { handleRequestError } from "api";
import { subAccountGroupToSubAccountNestedGroup } from "model/mappings";
import { SubAccountMapping } from "model/tableMappings";
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
  getAccountSubAccountsHistory,
  deleteSubAccountGroup
} from "services";
import { handleTableErrors } from "store/tasks";
import { setAncestorsLoadingAction, setAncestorsAction } from "../../actions";
import {
  loadingAccountAction,
  responseAccountAction,
  loadingSubAccountsAction,
  responseSubAccountsAction,
  deletingSubAccountAction,
  creatingSubAccountAction,
  updatingSubAccountAction,
  updateTableRowAction,
  activatePlaceholderAction,
  removeTableRowAction,
  addErrorsToTableAction,
  addPlaceholdersAction,
  requestSubAccountsAction,
  requestAccountAction,
  loadingCommentsAction,
  responseCommentsAction,
  submittingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updateCommentInStateAction,
  editingCommentAction,
  replyingToCommentAction,
  loadingSubAccountsHistoryAction,
  responseSubAccountsHistoryAction,
  deletingGroupAction,
  removeGroupFromTableAction,
  addGroupToTableAction,
  updateGroupInTableAction,
  updateAccountInStateAction,
  updateSubAccountInStateAction
} from "./actions";

export function* deleteSubAccountGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingGroupAction(true));
    try {
      yield call(deleteSubAccountGroup, action.payload);
      yield put(removeGroupFromTableAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the sub account group.");
    } finally {
      yield put(deletingGroupAction(false));
    }
  }
}

export function* addSubAccountGroupToStateTask(action: Redux.IAction<ISubAccountGroup>): SagaIterator {
  if (!isNil(action.payload)) {
    const nestedGroup = subAccountGroupToSubAccountNestedGroup(action.payload);
    yield put(
      addGroupToTableAction({
        group: nestedGroup,
        ids: map(action.payload.subaccounts, (subaccount: ISimpleSubAccount) => subaccount.id)
      })
    );
  }
}

export function* getSubAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId) && !isNil(budgetId)) {
    yield put(loadingSubAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getAccountSubAccountsHistory, accountId, budgetId);
      yield put(responseSubAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
    } finally {
      yield put(loadingSubAccountsHistoryAction(false));
    }
  }
}

export function* submitCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(submittingCommentAction(true));
    }
    try {
      let response: IComment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text);
      } else {
        response = yield call(createAccountComment, accountId, data);
      }
      yield put(addCommentToStateAction({ data: response, parent }));
    } catch (e) {
      handleRequestError(e, "There was an error submitting the comment.");
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToCommentAction({ id: parent, value: false }));
      } else {
        yield put(submittingCommentAction(false));
      }
    }
  }
}

export function* deleteCommentTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload);
      yield put(removeCommentFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the comment.");
    } finally {
      yield put(deletingCommentAction({ id: action.payload, value: false }));
    }
  }
}

export function* editAccountCommentTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(editingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(editingCommentAction({ id, value: false }));
    }
  }
}

export function* getAccountCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId)) {
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getAccountComments, accountId);
      yield put(responseCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's comments.");
      yield put(responseCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingCommentsAction(false));
    }
  }
}

export function* handleAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountAction()), put(requestSubAccountsAction())]);
}

// TODO: We need to also update the estimated, variance and actual values of the parent
// account when a sub account is removed!
export function* handleSubAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(action.payload) && !isNil(accountId)) {
    const tableData: Table.SubAccountRow[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table
    );
    const existing: Table.SubAccountRow | undefined = find(tableData, { id: action.payload });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.warn(
        `Inconsistent State!  Inconsistent state noticed when removing an account's sub account...
        The sub account with ID ${action.payload} does not exist in state when it is expected to.`
      );
    } else {
      // Dispatch the action to remove the row from the table in the UI.
      yield put(removeTableRowAction(action.payload));
      // Only make an API request to the server to delete the sub account if the  row was not a
      // placeholder (i.e. the sub account exists in the backend).
      if (existing.meta.isPlaceholder === false) {
        yield put(deletingSubAccountAction({ id: action.payload, value: true }));
        try {
          yield call(deleteSubAccount, action.payload);
        } catch (e) {
          handleRequestError(e, "There was an error deleting the sub account.");
        } finally {
          yield put(deletingSubAccountAction({ id: action.payload, value: false }));
        }
      }
    }
  }
}

export function* updateSubAccountPostRequestTask(
  request: Partial<Http.ISubAccountPayload>,
  subaccount: ISubAccount
): SagaIterator {
  // Dispatching this action will trigger the subaccount to update in both the  Redux state for the
  // table and the list response data.  Since we are using a deep check lodash.isEqual in the selectors,
  // this will only trigger a rerender if the subaccount has data that differs from that of the current data.
  yield put(updateSubAccountInStateAction({ id: subaccount.id, data: subaccount }));

  // Determine if the parent account needs to be refreshed due to updates to the underlying account
  // fields that calculate the values of the parent models.
  if (SubAccountMapping.patchRequestRequiresRecalculation(request)) {
    const account: IAccount = yield select((state: Redux.IApplicationStore) => state.calculator.account.detail.data);
    const subaccounts: ISubAccount[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.account.subaccounts.data
    );
    // Right now, the backend is configured such that the Actual value for the overall Account is
    // determined from the Actual values of the underlying SubAccount(s).  If that logic changes
    // in the backend, we need to also make that adjustment here.
    if (subaccounts.length !== 0) {
      const estimated = reduce(subaccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0);
      const actual = reduce(subaccounts, (sum: number, s: ISubAccount) => sum + (s.actual || 0), 0);
      let accountPayload: Partial<IAccount> = { estimated, actual };
      if (!isNil(account.actual)) {
        accountPayload = { ...accountPayload, variance: estimated - actual };
      }
      yield put(updateAccountInStateAction(accountPayload));
      // We should probably remove the group from the table if the response SubAccount does not have
      // a group - however, that will not happen in practice, because this task just handles the case
      // where the SubAccount is updated (not removed or added to a group).
      if (!isNil(subaccount.group)) {
        yield put(updateGroupInTableAction({ groupId: subaccount.group.id, group: subaccount.group }));
      }
    }
  }
}

export function* handleSubAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(accountId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const table = yield select((state: Redux.IApplicationStore) => state.calculator.account.subaccounts.table);

    const existing: Table.SubAccountRow = find(table, { id });
    if (isNil(existing)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
        the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
      );
    } else {
      // There are some cases where we need to update the row in the table before we make the request,
      // to improve the UI.  This happens for cells where the value is rendered via an HTML element
      // (i.e. the Unit Cell).  AGGridReact will not automatically update the cell when the Unit is
      // changed via the dropdown, so we need to udpate the row in the data used to populate the table.
      // We could do this by updating with a payload generated from the response, but it is quicker
      // to do it before hand.
      const preResponsePayload = SubAccountMapping.preRequestPayload(action.payload);
      if (Object.keys(preResponsePayload).length !== 0) {
        yield put(
          updateTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        const requestPayload = SubAccountMapping.postPayload(existing);
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (SubAccountMapping.rowHasRequiredFields(existing)) {
          yield put(creatingSubAccountAction(true));
          try {
            const response: ISubAccount = yield call(
              createAccountSubAccount,
              accountId,
              budgetId,
              requestPayload as Http.ISubAccountPayload
            );
            yield put(activatePlaceholderAction({ oldId: existing.id, id: response.id }));
            // TODO: We are going to want to eventually do this pre-request, which means manually
            // updating the SubAccount instead of using the response.
            yield call(updateSubAccountPostRequestTask, requestPayload, response);
          } catch (e) {
            yield call(
              handleTableErrors,
              e,
              "There was an error updating the sub account.",
              existing.id,
              (errors: Table.CellError[]) => addErrorsToTableAction(errors)
            );
          } finally {
            yield put(creatingSubAccountAction(false));
          }
        }
      } else {
        yield put(updatingSubAccountAction({ id: existing.id as number, value: true }));
        const requestPayload = SubAccountMapping.patchPayload(action.payload);
        try {
          const response: ISubAccount = yield call(updateSubAccount, existing.id as number, requestPayload);
          // TODO: We are going to want to eventually do this pre-request, which means manually
          // updating the SubAccount instead of using the response.
          yield call(updateSubAccountPostRequestTask, requestPayload, response);
        } catch (e) {
          yield call(
            handleTableErrors,
            e,
            "There was an error updating the sub account.",
            existing.id,
            (errors: Table.CellError[]) => addErrorsToTableAction(errors)
          );
        } finally {
          yield put(updatingSubAccountAction({ id: existing.id as number, value: false }));
        }
      }
    }
  }
}

export function* getSubAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(budgetId) && !isNil(accountId)) {
    yield put(loadingSubAccountsAction(true));
    try {
      const response: Http.IListResponse<ISubAccount> = yield call(getAccountSubAccounts, accountId, budgetId, {
        no_pagination: true
      });
      yield put(responseSubAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts.");
      yield put(responseSubAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingSubAccountsAction(false));
    }
  }
}

export function* getAccountTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.calculator.account.id);
  if (!isNil(accountId)) {
    let showLoadingIndicator = true;
    if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
      showLoadingIndicator = false;
    }
    if (showLoadingIndicator) {
      yield put(loadingAccountAction(true));
      yield put(setAncestorsLoadingAction(true));
    }
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
      if (showLoadingIndicator) {
        yield put(loadingAccountAction(false));
        yield put(setAncestorsLoadingAction(false));
      }
    }
  }
}
