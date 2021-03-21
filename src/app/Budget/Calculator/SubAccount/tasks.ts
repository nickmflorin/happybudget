import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, find, concat } from "lodash";
import { handleRequestError } from "api";
import {
  getSubAccountSubAccounts,
  createSubAccountSubAccount,
  updateSubAccount,
  deleteSubAccount,
  getSubAccount,
  getSubAccountComments,
  createSubAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getSubAccountSubAccountsHistory
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
  loadingSubAccountAction,
  responseSubAccountAction,
  loadingSubAccountSubAccountsAction,
  responseSubAccountSubAccountsAction,
  deletingSubAccountSubAccountAction,
  creatingSubAccountSubAccountAction,
  updatingSubAccountSubAccountAction,
  updateSubAccountSubAccountsTableRowAction,
  activateSubAccountSubAccountsTablePlaceholderAction,
  removeSubAccountSubAccountsTableRowAction,
  addErrorsToSubAccountSubAccountsTableAction,
  addSubAccountSubAccountsTablePlaceholdersAction,
  requestSubAccountSubAccountsAction,
  requestSubAccountAction,
  loadingSubAccountCommentsAction,
  responseSubAccountCommentsAction,
  submittingSubAccountCommentAction,
  addSubAccountCommentToStateAction,
  deletingSubAccountCommentAction,
  removeSubAccountCommentFromStateAction,
  updateSubAccountCommentInStateAction,
  editingSubAccountCommentAction,
  replyingToSubAccountCommentAction,
  loadingSubAccountSubAccountsHistoryAction,
  responseSubAccountSubAccountsHistoryAction
} from "../actions";

export function* getSubAccountSubAccountsHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId)) {
    yield put(loadingSubAccountSubAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getSubAccountSubAccountsHistory, subaccountId);
      yield put(responseSubAccountSubAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the sub account's sub accounts history.");
    } finally {
      yield put(loadingSubAccountSubAccountsHistoryAction(false));
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

export function* handleSubAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestSubAccountAction()), put(requestSubAccountSubAccountsAction())]);
}

export function* handleSubAccountSubAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(action.payload) && !isNil(subaccountId)) {
    const tableData: Table.SubAccountRow[] = yield select(
      (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.data
    );
    const existing: Table.SubAccountRow | undefined = find(tableData, { id: action.payload });
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

export function* handleSubAccountSubAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const subaccountId = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const table = yield select((state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.table.data);

    const existing: Table.SubAccountRow = find(table, { id: action.payload.id });
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
          updateSubAccountSubAccountsTableRowAction({
            id: existing.id,
            data: preResponsePayload
          })
        );
      }
      if (existing.meta.isPlaceholder === true) {
        // TODO: Should we be using the payload data here?  Instead of the existing row?
        // Or we should probably merge them, right?
        const requestPayload = postPayload<Table.SubAccountRow>(existing, "subaccount");
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (rowHasRequiredFields<Table.SubAccountRow>(existing, "subaccount")) {
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
              (errors: Table.CellError[]) => addErrorsToSubAccountSubAccountsTableAction(errors)
            );
          } finally {
            yield put(creatingSubAccountSubAccountAction(false));
          }
        }
      } else {
        yield put(updatingSubAccountSubAccountAction({ id: existing.id as number, value: true }));
        const requestPayload = patchPayload(action.payload, "subaccount") as Partial<Http.ISubAccountPayload>;
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
            (errors: Table.CellError[]) => addErrorsToSubAccountSubAccountsTableAction(errors)
          );
        } finally {
          yield put(updatingSubAccountSubAccountAction({ id: existing.id as number, value: false }));
        }
      }
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
