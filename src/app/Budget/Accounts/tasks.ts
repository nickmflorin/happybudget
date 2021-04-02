import { SagaIterator } from "redux-saga";
import { call, put, select, fork } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";
import { handleRequestError } from "api";
import { AccountMapping } from "model/tableMappings";
import { mergeRowChanges } from "model/util";
import {
  getAccounts,
  deleteAccount,
  updateAccount,
  createAccount,
  getBudgetComments,
  createBudgetComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountsHistory,
  deleteAccountGroup,
  getAccountGroups,
  bulkUpdateAccounts,
  bulkCreateAccounts
} from "services";
import { handleTableErrors } from "store/tasks";
import { userToSimpleUser } from "model/mappings";
import { nowAsString } from "util/dates";
import { generateRandomNumericId } from "util/math";
import {
  loadingAccountsAction,
  responseAccountsAction,
  deletingAccountAction,
  creatingAccountAction,
  updatingAccountAction,
  loadingCommentsAction,
  responseCommentsAction,
  submittingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updateCommentInStateAction,
  editingCommentAction,
  replyingToCommentAction,
  loadingAccountsHistoryAction,
  responseAccountsHistoryAction,
  addAccountsHistoryToStateAction,
  deletingGroupAction,
  removeGroupFromStateAction,
  updateAccountInStateAction,
  removeAccountFromStateAction,
  removePlaceholderFromStateAction,
  addPlaceholdersToStateAction,
  updatePlaceholderInStateAction,
  addErrorsToStateAction,
  activatePlaceholderAction,
  loadingGroupsAction,
  responseGroupsAction
} from "./actions";

export function* removeAccountFromGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(updatingAccountAction({ id: action.payload, value: true }));
    try {
      yield call(updateAccount, action.payload, { group: null });
    } catch (e) {
      yield call(
        handleTableErrors,
        e,
        "There was an error removing the account from the group.",
        action.payload,
        (errors: Table.CellError[]) => addErrorsToStateAction(errors)
      );
    } finally {
      yield put(updatingAccountAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteAccountGroupTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingGroupAction({ id: action.payload, value: true }));
    try {
      yield call(deleteAccountGroup, action.payload);
      yield put(removeGroupFromStateAction(action.payload));
    } catch (e) {
      handleRequestError(e, "There was an error deleting the account group.");
    } finally {
      yield put(deletingGroupAction({ id: action.payload, value: false }));
    }
  }
}

export function* deleteAccountTask(id: number): SagaIterator {
  yield put(deletingAccountAction({ id, value: true }));
  try {
    yield call(deleteAccount, id);
  } catch (e) {
    handleRequestError(e, "There was an error deleting the account.");
  } finally {
    yield put(deletingAccountAction({ id, value: false }));
  }
}

export function* updateAccountTask(id: number, change: Table.RowChange): SagaIterator {
  yield put(updatingAccountAction({ id, value: true }));
  try {
    yield call(updateAccount, id, AccountMapping.patchPayload(change));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the sub account.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingAccountAction({ id, value: false }));
  }
}

export function* createAccountTask(id: number, row: Table.AccountRow): SagaIterator {
  yield put(creatingAccountAction(true));
  try {
    const response: IAccount = yield call(createAccount, id, AccountMapping.postPayload(row));
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the account.", row.id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingAccountAction(false));
  }
}

export function* bulkUpdateAccountsTask(id: number, changes: Table.RowChange[]): SagaIterator {
  const requestPayload: Http.IAccountBulkUpdatePayload[] = map(changes, (change: Table.RowChange) => ({
    id: change.id,
    ...AccountMapping.patchPayload(change)
  }));
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingAccountAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateAccounts, id, requestPayload);
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the accounts.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingAccountAction({ id: changes[i].id, value: false }));
    }
  }
}

export function* bulkCreateAccountsTask(id: number, rows: Table.AccountRow[]): SagaIterator {
  const requestPayload: Http.IAccountPayload[] = map(rows, (row: Table.AccountRow) => AccountMapping.postPayload(row));
  yield put(creatingAccountAction(true));
  try {
    const accounts: IAccount[] = yield call(bulkCreateAccounts, id, requestPayload);
    for (let i = 0; i < accounts.length; i++) {
      // It is not ideal that we have to do this, but we have no other way to map a placeholder
      // to the returned Account when bulk creating.  We can rely on the identifier field being
      // unique (at least we hope it is) - otherwise the request will fail.
      const placeholder = find(rows, { identifier: accounts[i].identifier });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Could not map account ${accounts[i].id} to it's previous placeholder via the
          identifier, ${accounts[i].identifier}`
        );
      } else {
        yield put(activatePlaceholderAction({ id: placeholder.id, model: accounts[i] }));
      }
    }
  } catch (e) {
    // Once we rebuild back in the error handling, we will have to be concerned here with the nested
    // structure of the errors.
    yield call(handleTableErrors, e, "There was an error updating the accounts.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingAccountAction(false));
  }
}

export function* handleAccountRemovalTask(action: Redux.IAction<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: IAccount[] = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.data);
    const model: IAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.placeholders);
      const placeholder: Table.AccountRow | undefined = find(placeholders, { id: action.payload });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.warn(
          `Inconsistent State!  Inconsistent state noticed when removing account...
          The account with ID ${action.payload} does not exist in state when it is expected to.`
        );
      } else {
        yield put(removePlaceholderFromStateAction(placeholder.id));
      }
    } else {
      yield put(removeAccountFromStateAction(model.id));
      yield call(deleteAccountTask, model.id);
    }
  }
}

export function* handleAccountsBulkUpdateTask(action: Redux.IAction<Table.RowChange[]>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange[] };
    const merged: Table.RowChange[] = map(grouped, (changes: Table.RowChange[], id: string) => {
      return { data: mergeRowChanges(changes).data, id: parseInt(id) };
    });

    const data = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.data);
    const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.placeholders);

    const mergedUpdates: Table.RowChange[] = [];
    const placeholdersToCreate: Table.AccountRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: IAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.AccountRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating account in state...
            the account with ID ${merged[i].id} does not exist in state when it is expected to.`
          );
        } else {
          const updatedRow = AccountMapping.newRowWithChanges(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction(updatedRow));
          if (AccountMapping.rowHasRequiredFields(updatedRow)) {
            placeholdersToCreate.push(updatedRow);
          }
        }
      } else {
        const updatedModel = AccountMapping.newModelWithChanges(model, merged[i]);
        yield put(updateAccountInStateAction(updatedModel));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateAccountsTask, budgetId, mergedUpdates);
    }
    if (placeholdersToCreate.length !== 0) {
      yield fork(bulkCreateAccountsTask, budgetId, placeholdersToCreate);
    }
  }
}

export function* handleAccountUpdateTask(action: Redux.IAction<Table.RowChange>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: IAccount[] = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.data);
    const model: IAccount | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.IApplicationStore) => state.budget.budget.accounts.placeholders);
      const placeholder: Table.AccountRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating account in state...
          the account with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = AccountMapping.newRowWithChanges(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (AccountMapping.rowHasRequiredFields(updatedRow)) {
          yield call(createAccountTask, budgetId, updatedRow);
        }
      }
    } else {
      const updatedModel = AccountMapping.newModelWithChanges(model, action.payload);
      yield put(updateAccountInStateAction(updatedModel));
      yield call(updateAccountTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.IListResponse<IGroup<IAccount>> = yield call(getAccountGroups, budgetId, {
        no_pagination: true
      });
      yield put(responseGroupsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the account groups.");
      yield put(responseGroupsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingGroupsAction(false));
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
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}

export function* getCommentsTask(action: Redux.IAction<any>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getBudgetComments, budgetId);
      yield put(responseCommentsAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the budget's comments.");
      yield put(responseCommentsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingCommentsAction(false));
    }
  }
}

export function* submitCommentTask(
  action: Redux.IAction<{ parent?: number; data: Http.ICommentPayload }>
): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
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
        response = yield call(createBudgetComment, budgetId, data);
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

export function* editCommentTask(action: Redux.IAction<Redux.UpdateModelActionPayload<IComment>>): SagaIterator {
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

export function* getHistoryTask(action: Redux.IAction<null>): SagaIterator {
  const budgetId = yield select((state: Redux.IApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsHistoryAction(true));
    try {
      const response: Http.IListResponse<HistoryEvent> = yield call(getAccountsHistory, budgetId);
      yield put(responseAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the accounts history.");
    } finally {
      yield put(loadingAccountsHistoryAction(false));
    }
  }
}

export function* addToHistoryState(
  account: IAccount,
  eventType: HistoryEventType,
  data?: { field: string; newValue: string | number; oldValue: string | number | null }
): SagaIterator {
  const user = yield select((state: Redux.IApplicationStore) => state.user);
  const polymorphicEvent: PolymorphicEvent = {
    id: generateRandomNumericId(),
    created_at: nowAsString(),
    type: eventType,
    user: userToSimpleUser(user),
    content_object: {
      id: account.id,
      identifier: account.identifier,
      description: account.description,
      type: "account"
    }
  };
  if (eventType === "field_alteration") {
    if (!isNil(data)) {
      yield put(
        addAccountsHistoryToStateAction({
          ...polymorphicEvent,
          new_value: data.newValue,
          old_value: data.oldValue,
          field: data.field
        })
      );
    }
  } else {
    yield put(addAccountsHistoryToStateAction(polymorphicEvent as CreateEvent));
  }
}
