import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, all, cancelled, fork } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getAccountSubAccounts,
  updateSubAccount,
  deleteSubAccount,
  getAccount,
  deleteGroup,
  getAccountSubAccountGroups,
  bulkUpdateAccountSubAccounts,
  bulkCreateAccountSubAccounts
} from "api/services";

import { isAction } from "lib/redux/typeguards";
import { warnInconsistentState } from "lib/redux/util";
import { TemplateSubAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

import { loadingTemplateAction, requestTemplateAction } from "../../../actions/template";
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
  deletingGroupAction,
  removeGroupFromStateAction,
  updateSubAccountInStateAction,
  removeSubAccountFromStateAction,
  requestGroupsAction,
  responseGroupsAction,
  loadingGroupsAction,
  addSubAccountToStateAction
} from "../../../actions/template/account";

export function* handleAccountChangedTask(action: Redux.Action<number>): SagaIterator {
  yield all([put(requestAccountAction(null)), put(requestSubAccountsAction(null)), put(requestGroupsAction(null))]);
}

export function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(updatingSubAccountAction({ id: action.payload, value: true }));
    try {
      yield call(updateSubAccount, action.payload, { group: null }, { cancelToken: source.token });
    } catch (e) {
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error removing the sub account from the group.",
          action.payload,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      yield put(updatingSubAccountAction({ id: action.payload, value: false }));
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
        handleRequestError(e, "There was an error deleting the sub account group.");
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
  yield put(deletingSubAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestTemplateAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingTemplateAction(true));
  let success = true;
  try {
    yield call(deleteSubAccount, id, { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingTemplateAction(false));
    if (!(yield cancelled())) {
      handleRequestError(e, "There was an error deleting the sub account.");
    }
  } finally {
    yield put(deletingSubAccountAction({ id: id, value: false }));
    if (yield cancelled()) {
      success = false;
      source.cancel();
    }
  }
  if (success === true) {
    yield put(requestTemplateAction(null));
  }
}

export function* updateTask(id: number, change: Table.RowChange<Table.TemplateSubAccountRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingSubAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestTemplateAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingTemplateAction(true));
  let success = true;
  try {
    yield call(updateSubAccount, id, TemplateSubAccountRowManager.payload(change), { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingTemplateAction(false));
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
    yield put(updatingSubAccountAction({ id, value: false }));
    if (yield cancelled()) {
      success = false;
      source.cancel();
    }
  }
  if (success === true) {
    yield put(requestTemplateAction(null));
  }
}

export function* bulkUpdateTask(changes: Table.RowChange<Table.TemplateSubAccountRow>[]): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
      changes,
      (change: Table.RowChange<Table.TemplateSubAccountRow>) => ({
        id: change.id,
        ...TemplateSubAccountRowManager.payload(change)
      })
    );
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingSubAccountAction({ id: changes[i].id, value: true }));
    }
    try {
      yield call(bulkUpdateAccountSubAccounts, accountId, requestPayload, { cancelToken: source.token });
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the sub accounts.",
          accountId,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      for (let i = 0; i++; i < changes.length) {
        yield put(updatingSubAccountAction({ id: changes[i].id, value: false }));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* bulkCreateTask(action: Redux.Action<number> | number): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId) && (!isAction(action) || !isNil(action.payload))) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(creatingSubAccountAction(true));
    try {
      const subaccounts: Model.TemplateSubAccount[] = yield call(
        bulkCreateAccountSubAccounts,
        accountId,
        { count: isAction(action) ? action.payload : action },
        { cancelToken: source.token }
      );
      for (let i = 0; i < subaccounts.length; i++) {
        yield put(addSubAccountToStateAction(subaccounts[i]));
      }
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error creating the sub accounts.",
          accountId,
          (errors: Table.CellError[]) => addErrorsToStateAction(errors)
        );
      }
    } finally {
      yield put(creatingSubAccountAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* handleRemovalTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const models: Model.TemplateSubAccount[] = yield select(
      (state: Redux.ApplicationStore) => state.template.account.subaccounts.data
    );
    const model: Model.TemplateSubAccount | undefined = find(models, { id: action.payload });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Sub Account does not exist in state when it is expected to.",
        id: action.payload
      });
    } else {
      yield put(removeSubAccountFromStateAction(model.id));
      yield call(deleteTask, model.id);
    }
  }
}

export function* handleBulkUpdateTask(
  action: Redux.Action<Table.RowChange<Table.TemplateSubAccountRow>[]>
): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.TemplateSubAccountRow>[] };
    const merged: Table.RowChange<Table.TemplateSubAccountRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.TemplateSubAccountRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );

    const data = yield select((state: Redux.ApplicationStore) => state.template.account.subaccounts.data);
    const mergedUpdates: Table.RowChange<Table.TemplateSubAccountRow>[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.TemplateSubAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Sub Account does not exist in state when it is expected to.",
          id: merged[i].id
        });
      } else {
        const updatedModel = TemplateSubAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateSubAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
        mergedUpdates.push(merged[i]);
      }
    }
    yield put(requestTemplateAction(null));
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateTask, mergedUpdates);
    }
  }
}

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.TemplateSubAccountRow>>): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data = yield select((state: Redux.ApplicationStore) => state.template.account.subaccounts.data);
    const model: Model.TemplateSubAccount | undefined = find(data, { id });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Sub Account does not exist in state when it is expected to.",
        id: action.payload.id
      });
    } else {
      const updatedModel = TemplateSubAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateSubAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.TemplateGroup> = yield call(
        getAccountSubAccountGroups,
        accountId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseGroupsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account's sub account groups.");
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

export function* getSubAccountsTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingSubAccountsAction(true));
    try {
      const response: Http.ListResponse<Model.TemplateSubAccount> = yield call(
        getAccountSubAccounts,
        accountId,
        { no_pagination: true },
        { cancelToken: source.token }
      );
      yield put(responseSubAccountsAction(response));
      if (response.data.length === 0) {
        yield call(bulkCreateTask, 2);
      }
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account's sub accounts.");
        yield put(responseSubAccountsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingSubAccountsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getAccountTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.template.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    let showLoadingIndicator = true;
    if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
      showLoadingIndicator = false;
    }
    if (showLoadingIndicator) {
      yield put(loadingAccountAction(true));
    }
    try {
      const response: Model.TemplateAccount = yield call(getAccount, accountId, { cancelToken: source.token });
      yield put(responseAccountAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account.");
        yield put(responseAccountAction(undefined, { error: e }));
      }
    } finally {
      if (showLoadingIndicator) {
        yield put(loadingAccountAction(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}
