import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getTemplateAccounts,
  deleteAccount,
  updateAccount,
  deleteGroup,
  getTemplateAccountGroups,
  bulkUpdateTemplateAccounts,
  bulkCreateTemplateAccounts
} from "api/services";

import { warnInconsistentState } from "lib/redux/util";
import { isAction } from "lib/redux/typeguards";
import { TemplateAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

import { requestTemplateAction, loadingTemplateAction } from "../../../actions/template";
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
  addErrorsToStateAction,
  loadingGroupsAction,
  responseGroupsAction,
  addAccountToStateAction
} from "../../../actions/template/accounts";

export function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(updatingAccountAction({ id: action.payload, value: true }));
    try {
      yield call(updateAccount, action.payload, { group: null }, { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error removing the account from the group.",
          action.payload,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      yield put(updatingAccountAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteGroupTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(deletingGroupAction({ id: action.payload, value: true }));
    try {
      yield call(deleteGroup, action.payload, { cancelToken: source.token });
      yield put(removeGroupFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the account group.");
      }
    } finally {
      yield put(deletingGroupAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteTask(id: number): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(deletingAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestTemplateAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingTemplateAction(true));
  let success = true;
  try {
    yield call(deleteAccount, id, { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingTemplateAction(false));
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error deleting the account.");
    }
  } finally {
    yield put(deletingAccountAction({ id, value: false }));
    if (yield cancelled()) {
      success = false;
      source.cancel();
    }
  }
  if (success === true) {
    yield put(requestTemplateAction(null));
  }
}

export function* updateTask(id: number, change: Table.RowChange<Table.TemplateAccountRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingAccountAction({ id, value: true }));
  try {
    yield call(updateAccount, id, TemplateAccountRowManager.payload(change), { cancelToken: source.token });
  } catch (e) {
    if (!(yield cancelled())) {
      yield call(
        handleTableErrors,
        e,
        "There was an error updating the sub account.",
        id,
        (errors: Table.CellError[]) => addErrorsToStateAction(errors)
      );
    }
  } finally {
    yield put(updatingAccountAction({ id, value: false }));
    if (yield cancelled()) {
      source.cancel();
    }
  }
}

export function* bulkUpdateTask(changes: Table.RowChange<Table.TemplateAccountRow>[]): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
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
      yield call(bulkUpdateTemplateAccounts, templateId, requestPayload, { cancelToken: source.token });
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the accounts.",
          templateId,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      for (let i = 0; i++; i < changes.length) {
        yield put(updatingAccountAction({ id: changes[i].id, value: false }));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* bulkCreateTask(action: Redux.Action<number> | number): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId) && (!isAction(action) || !isNil(action.payload))) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(creatingAccountAction(true));
    try {
      const accounts: Model.TemplateAccount[] = yield call(
        bulkCreateTemplateAccounts,
        templateId,
        { count: isAction(action) ? action.payload : action },
        { cancelToken: source.token }
      );
      for (let i = 0; i < accounts.length; i++) {
        yield put(addAccountToStateAction(accounts[i]));
      }
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error creating the accounts.",
          templateId,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      yield put(creatingAccountAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload) && !(yield cancelled())) {
    const models: Model.TemplateAccount[] = yield select(
      (state: Redux.ApplicationStore) => state.template.accounts.data
    );
    const model: Model.TemplateAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Account does not exist in state when it is expected to.",
        id: action.payload
      });
    } else {
      yield put(removeAccountFromStateAction(model.id));
      yield call(deleteTask, model.id);
    }
  }
}

export function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<Table.TemplateAccountRow>[]>): SagaIterator {
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
    const mergedUpdates: Table.RowChange<Table.TemplateAccountRow>[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.TemplateAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state when it is expected to.",
          id: merged[i].id
        });
      } else {
        const updatedModel = TemplateAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateTask, mergedUpdates);
    }
  }
}

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.TemplateAccountRow>>): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.TemplateAccount[] = yield select((state: Redux.ApplicationStore) => state.template.accounts.data);
    const model: Model.TemplateAccount | undefined = find(data, { id });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Account does not exist in state when it is expected to.",
        id: action.payload.id
      });
    } else {
      const updatedModel = TemplateAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.TemplateGroup> = yield call(
        getTemplateAccountGroups,
        templateId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseGroupsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account groups.");
        yield put(responseGroupsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingGroupsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getAccountsTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Redux.ApplicationStore) => state.template.template.id);
  if (!isNil(templateId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(
        getTemplateAccounts,
        templateId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseAccountsAction(response));
      if (response.data.length === 0) {
        yield call(bulkCreateTask, 2);
      }
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the template's accounts.");
        yield put(responseAccountsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingAccountsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}
