import { SagaIterator } from "redux-saga";
import { call, put, select, fork } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";
import { handleRequestError } from "api";
import { BudgetAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import {
  getBudgetAccounts,
  deleteAccount,
  updateAccount,
  createBudgetAccount,
  getBudgetComments,
  createBudgetComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountsHistory,
  deleteGroup,
  getBudgetAccountGroups,
  bulkUpdateBudgetAccounts,
  bulkCreateBudgetAccounts
} from "api/services";
import { handleTableErrors } from "store/tasks";
import { userToSimpleUser } from "lib/model/mappings";
import { nowAsString } from "lib/util/dates";
import { generateRandomNumericId } from "lib/util";
import { requestBudgetAction, loadingBudgetAction } from "../../actions/budget";
import {
  loadingAccountsAction,
  responseAccountsAction,
  deletingAccountAction,
  creatingAccountAction,
  updatingAccountAction,
  loadingCommentsAction,
  responseCommentsAction,
  creatingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updateCommentInStateAction,
  updatingCommentAction,
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
} from "../../actions/budget/accounts";

export function* removeAccountFromGroupTask(action: Redux.Action<number>): SagaIterator {
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

export function* deleteAccountGroupTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    yield put(deletingGroupAction({ id: action.payload, value: true }));
    try {
      yield call(deleteGroup, action.payload);
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
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(deleteAccount, id);
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
    handleRequestError(e, "There was an error deleting the account.");
  } finally {
    yield put(deletingAccountAction({ id, value: false }));
  }
  if (success === true) {
    yield put(requestBudgetAction(null));
  }
}

export function* updateAccountTask(id: number, change: Table.RowChange<Table.BudgetAccountRow>): SagaIterator {
  yield put(updatingAccountAction({ id, value: true }));
  try {
    yield call(updateAccount, id, BudgetAccountRowManager.payload(change));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the sub account.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingAccountAction({ id, value: false }));
  }
}

export function* createAccountTask(id: number, row: Table.BudgetAccountRow): SagaIterator {
  yield put(creatingAccountAction(true));
  try {
    const response: Model.BudgetAccount = yield call(createBudgetAccount, id, BudgetAccountRowManager.payload(row));
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the account.", row.id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingAccountAction(false));
  }
}

export function* bulkUpdateAccountsTask(id: number, changes: Table.RowChange<Table.BudgetAccountRow>[]): SagaIterator {
  const requestPayload: Http.BulkUpdatePayload<Http.BudgetAccountPayload>[] = map(
    changes,
    (change: Table.RowChange<Table.BudgetAccountRow>) => ({
      id: change.id,
      ...BudgetAccountRowManager.payload(change)
    })
  );
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingAccountAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateBudgetAccounts, id, requestPayload);
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

export function* bulkCreateAccountsTask(id: number, rows: Table.BudgetAccountRow[]): SagaIterator {
  const requestPayload: Http.AccountPayload[] = map(rows, (row: Table.BudgetAccountRow) =>
    BudgetAccountRowManager.payload(row)
  );
  yield put(creatingAccountAction(true));
  try {
    const accounts: Model.BudgetAccount[] = yield call(bulkCreateBudgetAccounts, id, requestPayload);
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

export function* handleAccountRemovalTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: Model.BudgetAccount[] = yield select((state: Redux.ApplicationStore) => state.budget.accounts.data);
    const model: Model.BudgetAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.accounts.placeholders);
      const placeholder: Table.BudgetAccountRow | undefined = find(placeholders, { id: action.payload });
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

export function* handleAccountsBulkUpdateTask(
  action: Redux.Action<Table.RowChange<Table.BudgetAccountRow>[]>
): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.BudgetAccountRow>[] };
    const merged: Table.RowChange<Table.BudgetAccountRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.BudgetAccountRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );

    const data = yield select((state: Redux.ApplicationStore) => state.budget.accounts.data);
    const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.accounts.placeholders);

    const mergedUpdates: Table.RowChange<Table.BudgetAccountRow>[] = [];
    const placeholdersToCreate: Table.BudgetAccountRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.BudgetAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.BudgetAccountRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating account in state...
            the account with ID ${merged[i].id} does not exist in state when it is expected to.`
          );
        } else {
          const updatedRow = BudgetAccountRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
          if (BudgetAccountRowManager.rowHasRequiredFields(updatedRow)) {
            placeholdersToCreate.push(updatedRow);
          }
        }
      } else {
        const updatedModel = BudgetAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
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

export function* handleAccountUpdateTask(action: Redux.Action<Table.RowChange<Table.BudgetAccountRow>>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.BudgetAccount[] = yield select((state: Redux.ApplicationStore) => state.budget.accounts.data);
    const model: Model.BudgetAccount | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.budget.accounts.placeholders);
      const placeholder: Table.BudgetAccountRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating account in state...
          the account with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = BudgetAccountRowManager.mergeChangesWithRow(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction({ id: updatedRow.id, data: updatedRow }));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (BudgetAccountRowManager.rowHasRequiredFields(updatedRow)) {
          yield call(createAccountTask, budgetId, updatedRow);
        }
      }
    } else {
      const updatedModel = BudgetAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateAccountTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.BudgetGroup> = yield call(getBudgetAccountGroups, budgetId, {
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

export function* getAccountsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getBudgetAccounts, budgetId, { no_pagination: true });
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

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
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

export function* submitCommentTask(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(creatingCommentAction(true));
    }
    try {
      let response: Comment;
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
        yield put(creatingCommentAction(false));
      }
    }
  }
}

export function* deleteCommentTask(action: Redux.Action<number>): SagaIterator {
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

export function* editCommentTask(action: Redux.Action<Redux.UpdateModelActionPayload<Model.Comment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const { id, data } = action.payload;
    yield put(updatingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<Model.Comment> can be mapped to Partial<Http.CommentPayload>,
      // which is the case right now but may not be in the future.
      const response: Model.Comment = yield call(updateComment, id, data as Partial<Http.CommentPayload>);
      yield put(updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      handleRequestError(e, "There was an error updating the comment.");
    } finally {
      yield put(updatingCommentAction({ id, value: false }));
    }
  }
}

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    yield put(loadingAccountsHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(getAccountsHistory, budgetId);
      yield put(responseAccountsHistoryAction(response));
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the accounts history.");
    } finally {
      yield put(loadingAccountsHistoryAction(false));
    }
  }
}

export function* addToHistoryState(
  account: Model.BudgetAccount,
  eventType: Model.HistoryEventType,
  data?: { field: string; newValue: string | number; oldValue: string | number | null }
): SagaIterator {
  const user = yield select((state: Redux.ApplicationStore) => state.user);
  const polymorphicEvent: Model.PolymorphicEvent = {
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
    yield put(addAccountsHistoryToStateAction(polymorphicEvent as Model.CreateEvent));
  }
}
