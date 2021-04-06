import { SagaIterator } from "redux-saga";
import { CallEffect, call, put, select, all } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";
import { handleRequestError } from "api";
import { SubAccountMapping } from "lib/tabling/mappings";
import { mergeRowChanges } from "lib/model/util";
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
  deleteSubAccountGroup,
  getAccountSubAccountGroups,
  bulkUpdateAccountSubAccounts,
  bulkCreateAccountSubAccounts
} from "api/services";
import { handleTableErrors } from "store/tasks";
import { loadingBudgetAction, requestBudgetAction } from "../actions";
import {
  loadingAccountAction,
  responseAccountAction,
  loadingSubAccountsAction,
  responseSubAccountsAction,
  deletingSubAccountAction,
  creatingSubAccountAction,
  updatingSubAccountAction,
  addErrorsToStateAction,
  requestSubAccountsAction,
  requestAccountAction,
  loadingCommentsAction,
  responseCommentsAction,
  creatingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updateCommentInStateAction,
  updatingCommentAction,
  replyingToCommentAction,
  loadingHistoryAction,
  responseHistoryAction,
  deletingGroupAction,
  removeGroupFromStateAction,
  updateSubAccountInStateAction,
  removeSubAccountFromStateAction,
  removePlaceholderFromStateAction,
  addPlaceholdersToStateAction,
  updatePlaceholderInStateAction,
  activatePlaceholderAction,
  requestGroupsAction,
  responseGroupsAction,
  loadingGroupsAction
} from "../actions/account";

export function* handleAccountChangedTask(action: Redux.IAction<number>): SagaIterator {
  yield all([put(requestAccountAction(null)), put(requestSubAccountsAction(null)), put(requestGroupsAction(null))]);
}

export function* removeSubAccountFromGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(updatingSubAccountAction({ id: action.payload, value: true }));
    try {
      // NOTE: We do not need to update the SubAccount in state because the reducer will already
      // disassociate the SubAccount from the group.
      yield call(updateSubAccount, action.payload, { group: null });
    } catch (e) {
      yield call(
        handleTableErrors,
        e,
        "There was an error removing the sub account from the group.",
        action.payload,
        (errors: Table.CellError[]) => addErrorsToStateAction(errors)
      );
    } finally {
      yield put(updatingSubAccountAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteSubAccountGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingGroupAction({ id: action.payload, value: true }));
    try {
      yield call(deleteSubAccountGroup, action.payload);
      yield put(removeGroupFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the sub account group.");
    } finally {
      yield put(deletingGroupAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteSubAccountTask(id: number): SagaIterator {
  yield put(deletingSubAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(deleteSubAccount, id);
  } catch (e) {
    success = false;
    handleRequestError(e, "There was an error deleting the sub account.");
  } finally {
    yield put(deletingSubAccountAction({ id: id, value: false }));
  }
  if (success === true) {
    yield put(requestBudgetAction(null));
  }
}

export function* updateSubAccountTask(id: number, change: Table.RowChange): SagaIterator {
  yield put(updatingSubAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(updateSubAccount, id, SubAccountMapping.patchPayload(change));
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
    yield call(handleTableErrors, e, "There was an error updating the sub account.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingSubAccountAction({ id, value: false }));
  }
  if (success === true) {
    yield put(requestBudgetAction(null));
  }
}

export function* createSubAccountTask(id: number, row: Table.SubAccountRow): SagaIterator {
  yield put(creatingSubAccountAction(true));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    const response: ISubAccount = yield call(createAccountSubAccount, id, SubAccountMapping.postPayload(row));
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
    yield call(
      handleTableErrors,
      e,
      "There was an error updating the sub account.",
      row.id,
      (errors: Table.CellError[]) => addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingSubAccountAction(false));
  }
  if (success === true) {
    yield put(requestBudgetAction(null));
  }
}

export function* bulkUpdateAccountSubAccountsTask(id: number, changes: Table.RowChange[]): SagaIterator {
  const requestPayload: Http.ISubAccountBulkUpdatePayload[] = map(changes, (change: Table.RowChange) => ({
    id: change.id,
    ...SubAccountMapping.patchPayload(change)
  }));
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingSubAccountAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateAccountSubAccounts, id, requestPayload);
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the sub accounts.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingSubAccountAction({ id: changes[i].id, value: false }));
    }
  }
}

export function* bulkCreateAccountSubAccountsTask(id: number, rows: Table.SubAccountRow[]): SagaIterator {
  const requestPayload: Http.ISubAccountPayload[] = map(rows, (row: Table.SubAccountRow) =>
    SubAccountMapping.postPayload(row)
  );
  yield put(creatingSubAccountAction(true));
  try {
    const subaccounts: ISubAccount[] = yield call(bulkCreateAccountSubAccounts, id, requestPayload);
    for (let i = 0; i < subaccounts.length; i++) {
      // It is not ideal that we have to do this, but we have no other way to map a placeholder
      // to the returned SubAccount when bulk creating.  We can rely on the identifier field being
      // unique (at least we hope it is) - otherwise the request will fail.
      const placeholder = find(rows, { identifier: subaccounts[i].identifier });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Could not map sub-account ${subaccounts[i].id} to it's previous placeholder via the
          identifier, ${subaccounts[i].identifier}`
        );
      } else {
        yield put(activatePlaceholderAction({ id: placeholder.id, model: subaccounts[i] }));
      }
    }
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the sub accounts.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingSubAccountAction(false));
  }
}

export function* handleSubAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: ISubAccount[] = yield select(
      (state: Redux.IApplicationStore) => state.budget.account.subaccounts.data
    );
    const model: ISubAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select(
        (state: Redux.IApplicationStore) => state.budget.account.subaccounts.placeholders
      );
      const placeholder: Table.SubAccountRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing sub account...
          The sub account with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeSubAccountFromStateAction(model.id));
      yield call(deleteSubAccountTask, model.id);
    }
  }
}

export function* handleAccountBulkUpdateTask(action: Redux.IAction<Table.RowChange[]>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange[] };
    const merged: Table.RowChange[] = map(grouped, (changes: Table.RowChange[], id: string) => {
      return { data: mergeRowChanges(changes).data, id: parseInt(id) };
    });

    const data = yield select((state: Redux.IApplicationStore) => state.budget.account.subaccounts.data);
    const placeholders = yield select(
      (state: Redux.IApplicationStore) => state.budget.account.subaccounts.placeholders
    );

    const mergedUpdates: Table.RowChange[] = [];
    const placeholdersToCreate: Table.SubAccountRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: ISubAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.SubAccountRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
            the subaccount with ID ${merged[i].id} does not exist in state when it is expected to.`
          );
        } else {
          const updatedRow = SubAccountMapping.newRowWithChanges(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction(updatedRow));
          if (SubAccountMapping.rowHasRequiredFields(updatedRow)) {
            placeholdersToCreate.push(updatedRow);
          }
        }
      } else {
        const updatedModel = SubAccountMapping.newModelWithChanges(model, merged[i]);
        yield put(updateSubAccountInStateAction(updatedModel));
        mergedUpdates.push(merged[i]);
      }
    }
    const effects: CallEffect[] = [];
    if (mergedUpdates.length !== 0) {
      effects.push(call(bulkUpdateAccountSubAccountsTask, accountId, mergedUpdates));
    }
    if (placeholdersToCreate.length !== 0) {
      effects.push(call(bulkCreateAccountSubAccountsTask, accountId, placeholdersToCreate));
    }
    yield all(effects);
    yield put(requestBudgetAction(null));
  }
}

export function* handleSubAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const id = action.payload.id;

    const data = yield select((state: Redux.IApplicationStore) => state.budget.account.subaccounts.data);
    const model: ISubAccount | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select(
        (state: Redux.IApplicationStore) => state.budget.account.subaccounts.placeholders
      );
      const placeholder: Table.SubAccountRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating sub account in state...
          the subaccount with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = SubAccountMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (SubAccountMapping.rowHasRequiredFields(updatedRow)) {
          yield call(createSubAccountTask, accountId, updatedRow);
        }
      }
    } else {
      const updatedModel = SubAccountMapping.newModelWithChanges(model, action.payload);
      yield put(updateSubAccountInStateAction(updatedModel));
      yield call(updateSubAccountTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId)) {
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.IListResponse<IGroup<ISimpleSubAccount>> = yield call(
        getAccountSubAccountGroups,
        accountId,
        { no_pagination: true }
      );
      yield put(responseGroupsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub account groups.");
      yield put(responseGroupsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingGroupsAction(false));
    }
  }
}

export function* getSubAccountsTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId)) {
    yield put(loadingSubAccountsAction(true));
    try {
      const response: Http.IListResponse<ISubAccount> = yield call(getAccountSubAccounts, accountId, {
        no_pagination: true
      });
      yield put(responseSubAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
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
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId)) {
    let showLoadingIndicator = true;
    if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
      showLoadingIndicator = false;
    }
    if (showLoadingIndicator) {
      yield put(loadingAccountAction(true));
    }
    try {
      const response: IAccount = yield call(getAccount, accountId);
      yield put(responseAccountAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account.");
      yield put(responseAccountAction(undefined, { error: e }));
    } finally {
      if (showLoadingIndicator) {
        yield put(loadingAccountAction(false));
      }
    }
  }
}

export function* getHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId)) {
    yield put(loadingHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getAccountSubAccountsHistory, accountId);
      yield put(responseHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
    } finally {
      yield put(loadingHistoryAction(false));
    }
  }
}

export function* submitCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(creatingCommentAction(true));
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
        yield put(creatingCommentAction(false));
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
    yield put(updatingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<IComment> can be mapped to Partial<Http.ICommentPayload>,
      // which is the case right now but may not be in the future.
      const response: IComment = yield call(updateComment, id, data as Partial<Http.ICommentPayload>);
      yield put(updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(updatingCommentAction({ id, value: false }));
    }
  }
}

export function* getAccountCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const accountId = yield select((state: Redux.IApplicationStore) => state.budget.account.id);
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
