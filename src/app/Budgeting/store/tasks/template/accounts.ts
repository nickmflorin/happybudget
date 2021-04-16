import { SagaIterator } from "redux-saga";
import { call, put, select, fork } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";
import { handleRequestError } from "api";
import { TemplateAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import {
  getTemplateAccounts,
  deleteAccount,
  updateAccount,
  createTemplateAccount,
  deleteGroup,
  getTemplateAccountGroups,
  bulkUpdateTemplateAccounts,
  bulkCreateTemplateAccounts
} from "api/services";
import { handleTableErrors } from "store/tasks";
import { requestTemplateAction, loadingTemplateAction } from "../../actions/template";
import {
  loadingAccountsAction,
  responseAccountsAction,
  deletingAccountAction,
  creatingAccountAction,
  updatingAccountAction,
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
} from "../../actions/template/accounts";

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
  yield put(loadingTemplateAction(true));
  let success = true;
  try {
    yield call(deleteAccount, id);
  } catch (e) {
    success = false;
    yield put(loadingTemplateAction(false));
    handleRequestError(e, "There was an error deleting the account.");
  } finally {
    yield put(deletingAccountAction({ id, value: false }));
  }
  if (success === true) {
    yield put(requestTemplateAction(null));
  }
}

export function* updateAccountTask(id: number, change: Table.RowChange<Table.TemplateAccountRow>): SagaIterator {
  yield put(updatingAccountAction({ id, value: true }));
  try {
    yield call(updateAccount, id, TemplateAccountRowManager.payload(change));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the sub account.", id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(updatingAccountAction({ id, value: false }));
  }
}

export function* createAccountTask(id: number, row: Table.TemplateAccountRow): SagaIterator {
  yield put(creatingAccountAction(true));
  try {
    const response: Model.TemplateAccount = yield call(
      createTemplateAccount,
      id,
      TemplateAccountRowManager.payload(row)
    );
    yield put(activatePlaceholderAction({ id: row.id, model: response }));
  } catch (e) {
    yield call(handleTableErrors, e, "There was an error updating the account.", row.id, (errors: Table.CellError[]) =>
      addErrorsToStateAction(errors)
    );
  } finally {
    yield put(creatingAccountAction(false));
  }
}

export function* bulkUpdateAccountsTask(
  id: number,
  changes: Table.RowChange<Table.TemplateAccountRow>[]
): SagaIterator {
  const requestPayload: Http.BulkUpdatePayload<Http.TemplateAccountPayload>[] = map(
    changes,
    (change: Table.RowChange<Table.TemplateAccountRow>) => ({
      id: change.id,
      ...TemplateAccountRowManager.payload(change)
    })
  );
  for (let i = 0; i++; i < changes.length) {
    yield put(updatingAccountAction({ id: changes[i].id, value: true }));
  }
  try {
    yield call(bulkUpdateTemplateAccounts, id, requestPayload);
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

export function* bulkCreateAccountsTask(id: number, rows: Table.TemplateAccountRow[]): SagaIterator {
  const requestPayload: Http.AccountPayload[] = map(rows, (row: Table.TemplateAccountRow) =>
    TemplateAccountRowManager.payload(row)
  );
  yield put(creatingAccountAction(true));
  try {
    const accounts: Model.TemplateAccount[] = yield call(bulkCreateTemplateAccounts, id, requestPayload);
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
    const models: Model.TemplateAccount[] = yield select(
      (state: Redux.ApplicationStore) => state.template.accounts.data
    );
    const model: Model.TemplateAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.template.accounts.placeholders);
      const placeholder: Table.TemplateAccountRow | undefined = find(placeholders, { id: action.payload });
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
  action: Redux.Action<Table.RowChange<Table.TemplateAccountRow>[]>
): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.TemplateAccountRow>[] };
    const merged: Table.RowChange<Table.TemplateAccountRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.TemplateAccountRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );

    const data = yield select((state: Redux.ApplicationStore) => state.template.accounts.data);
    const placeholders = yield select((state: Redux.ApplicationStore) => state.template.accounts.placeholders);

    const mergedUpdates: Table.RowChange<Table.TemplateAccountRow>[] = [];
    const placeholdersToCreate: Table.TemplateAccountRow[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.TemplateAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        const placeholder: Table.TemplateAccountRow | undefined = find(placeholders, { id: merged[i].id });
        if (isNil(placeholder)) {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State!:  Inconsistent state noticed when updating account in state...
            the account with ID ${merged[i].id} does not exist in state when it is expected to.`
          );
        } else {
          const updatedRow = TemplateAccountRowManager.mergeChangesWithRow(placeholder, merged[i]);
          yield put(updatePlaceholderInStateAction(updatedRow));
          if (TemplateAccountRowManager.rowHasRequiredFields(updatedRow)) {
            placeholdersToCreate.push(updatedRow);
          }
        }
      } else {
        const updatedModel = TemplateAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateAccountInStateAction(updatedModel));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateAccountsTask, templateId, mergedUpdates);
    }
    if (placeholdersToCreate.length !== 0) {
      yield fork(bulkCreateAccountsTask, templateId, placeholdersToCreate);
    }
  }
}

export function* handleAccountUpdateTask(
  action: Redux.Action<Table.RowChange<Table.TemplateAccountRow>>
): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.TemplateAccount[] = yield select((state: Redux.ApplicationStore) => state.template.accounts.data);
    const model: Model.TemplateAccount | undefined = find(data, { id });
    if (isNil(model)) {
      const placeholders = yield select((state: Redux.ApplicationStore) => state.template.accounts.placeholders);
      const placeholder: Table.TemplateAccountRow | undefined = find(placeholders, { id });
      if (isNil(placeholder)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating account in state...
          the account with ID ${action.payload.id} does not exist in state when it is expected to.`
        );
      } else {
        const updatedRow = TemplateAccountRowManager.mergeChangesWithRow(placeholder, action.payload);
        yield put(updatePlaceholderInStateAction(updatedRow));
        // Wait until all of the required fields are present before we create the entity in the
        // backend.  Once the entity is created in the backend, we can remove the placeholder
        // designation of the row so it will be updated instead of created the next time the row
        // is changed.
        if (TemplateAccountRowManager.rowHasRequiredFields(updatedRow)) {
          yield call(createAccountTask, templateId, updatedRow);
        }
      }
    } else {
      const updatedModel = TemplateAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateAccountInStateAction(updatedModel));
      yield call(updateAccountTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.TemplateGroup> = yield call(getTemplateAccountGroups, templateId, {
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
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getTemplateAccounts, templateId, { no_pagination: true });
      yield put(responseAccountsAction(response));
      if (response.data.length === 0) {
        yield put(addPlaceholdersToStateAction(2));
      }
    } catch (e) {
      handleRequestError(e, "There was an error retrieving the template's accounts.");
      yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
    } finally {
      yield put(loadingAccountsAction(false));
    }
  }
}
