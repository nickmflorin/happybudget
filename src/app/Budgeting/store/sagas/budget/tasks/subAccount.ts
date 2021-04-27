import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, all, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getSubAccountSubAccounts,
  updateSubAccount,
  deleteSubAccount,
  getSubAccount,
  getSubAccountComments,
  createSubAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getSubAccountSubAccountsHistory,
  deleteGroup,
  getSubAccountSubAccountGroups,
  bulkUpdateSubAccountSubAccounts,
  bulkCreateSubAccountSubAccounts
} from "api/services";

import { warnInconsistentState } from "lib/redux/util";
import { isAction } from "lib/redux/typeguards";
import { BudgetSubAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";
import { handleTableErrors } from "store/tasks";

import { loadingBudgetAction, requestBudgetAction } from "../../../actions/budget";
import {
  loadingSubAccountAction,
  responseSubAccountAction,
  requestSubAccountAction,
  loadingSubAccountsAction,
  responseSubAccountsAction,
  deletingSubAccountAction,
  creatingSubAccountAction,
  updatingSubAccountAction,
  requestSubAccountsAction,
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
  addErrorsToStateAction,
  loadingGroupsAction,
  responseGroupsAction,
  requestGroupsAction,
  addSubAccountToStateAction
} from "../../../actions/budget/subAccount";

export function* handleSubAccountChangedTask(action: Redux.Action<number>): SagaIterator {
  yield all([put(requestSubAccountAction(null)), put(requestSubAccountsAction(null)), put(requestGroupsAction(null))]);
}

export function* removeFromGroupTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(updatingSubAccountAction({ id: action.payload, value: true }));
    try {
      // NOTE: We do not need to update the SubAccount in state because the reducer will already
      // disassociate the SubAccount from the group.
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
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(deleteSubAccount, id, { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
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
    yield put(requestBudgetAction(null));
  }
}

export function* updateTask(id: number, change: Table.RowChange<Table.BudgetSubAccountRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingSubAccountAction({ id, value: true }));
  // We do this to show the loading indicator next to the calculated fields of the Budget Footer Row,
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(updateSubAccount, id, BudgetSubAccountRowManager.payload(change), { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
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
    yield put(requestBudgetAction(null));
  }
}

export function* bulkUpdateTask(changes: Table.RowChange<Table.BudgetSubAccountRow>[]): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestPayload: Http.BulkUpdatePayload<Http.SubAccountPayload>[] = map(
      changes,
      (change: Table.RowChange<Table.BudgetSubAccountRow>) => ({
        id: change.id,
        ...BudgetSubAccountRowManager.payload(change)
      })
    );
    for (let i = 0; i++; i < changes.length) {
      yield put(updatingSubAccountAction({ id: changes[i].id, value: true }));
    }
    try {
      yield call(bulkUpdateSubAccountSubAccounts, subaccountId, requestPayload, { cancelToken: source.token });
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the sub accounts.",
          subaccountId,
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
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId) && (!isAction(action) || !isNil(action.payload))) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(creatingSubAccountAction(true));
    try {
      const subaccounts: Model.BudgetSubAccount[] = yield call(
        bulkCreateSubAccountSubAccounts,
        subaccountId,
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
          subaccountId,
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
    const models: Model.BudgetSubAccount[] = yield select(
      (state: Redux.ApplicationStore) => state.budget.account.subaccounts.data
    );
    const model: Model.BudgetSubAccount | undefined = find(models, { id: action.payload });
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
  action: Redux.Action<Table.RowChange<Table.BudgetSubAccountRow>[]>
): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const grouped = groupBy(action.payload, "id") as { [key: string]: Table.RowChange<Table.BudgetSubAccountRow>[] };
    const merged: Table.RowChange<Table.BudgetSubAccountRow>[] = map(
      grouped,
      (changes: Table.RowChange<Table.BudgetSubAccountRow>[], id: string) => {
        return { data: mergeRowChanges(changes).data, id: parseInt(id) };
      }
    );

    const data = yield select((state: Redux.ApplicationStore) => state.budget.account.subaccounts.data);
    const mergedUpdates: Table.RowChange<Table.BudgetSubAccountRow>[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.BudgetSubAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Sub Account does not exist in state when it is expected to.",
          id: merged[i].id
        });
      } else {
        const updatedModel = BudgetSubAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateSubAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
        mergedUpdates.push(merged[i]);
      }
    }
    yield put(requestBudgetAction(null));
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateTask, mergedUpdates);
    }
  }
}

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.BudgetSubAccountRow>>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data = yield select((state: Redux.ApplicationStore) => state.budget.account.subaccounts.data);
    const model: Model.BudgetSubAccount | undefined = find(data, { id });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Sub Account does not exist in state when it is expected to.",
        id: action.payload.id
      });
    } else {
      const updatedModel = BudgetSubAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateSubAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.BudgetGroup> = yield call(
        getSubAccountSubAccountGroups,
        subaccountId,
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
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingSubAccountsAction(true));
    try {
      const response: Http.ListResponse<Model.BudgetSubAccount> = yield call(
        getSubAccountSubAccounts,
        subaccountId,
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

export function* getSubAccountTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    let showLoadingIndicator = true;
    if (!isNil(action.meta) && action.meta.showLoadingIndicator === false) {
      showLoadingIndicator = false;
    }
    if (showLoadingIndicator) {
      yield put(loadingSubAccountAction(true));
    }
    try {
      const response: Model.BudgetSubAccount = yield call(getSubAccount, subaccountId, { cancelToken: source.token });
      yield put(responseSubAccountAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the sub account.");
        yield put(responseSubAccountAction(undefined, { error: e }));
      }
    } finally {
      if (showLoadingIndicator) {
        yield put(loadingSubAccountAction(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        getSubAccountSubAccountsHistory,
        subaccountId,
        {},
        { cancelToken: source.token }
      );
      yield put(responseHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the sub account's sub accounts history.");
      }
    } finally {
      yield put(loadingHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* submitCommentTask(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId) && !isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(creatingCommentAction(true));
    }
    try {
      let response: Model.Comment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text, { cancelToken: source.token });
      } else {
        response = yield call(createSubAccountComment, subaccountId, data, { cancelToken: source.token });
      }
      yield put(addCommentToStateAction({ data: response, parent }));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error submitting the comment.");
      }
    } finally {
      if (!isNil(parent)) {
        yield put(replyingToCommentAction({ id: parent, value: false }));
      } else {
        yield put(creatingCommentAction(false));
      }
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* deleteCommentTask(action: Redux.Action<number>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(deletingCommentAction({ id: action.payload, value: true }));
    try {
      yield call(deleteComment, action.payload, { cancelToken: source.token });
      yield put(removeCommentFromStateAction(action.payload));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error deleting the comment.");
      }
    } finally {
      yield put(deletingCommentAction({ id: action.payload, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* editCommentTask(action: Redux.Action<Redux.UpdateModelActionPayload<Model.Comment>>): SagaIterator {
  if (!isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { id, data } = action.payload;
    yield put(updatingCommentAction({ id, value: true }));
    try {
      // Here we are assuming that Partial<Model.Comment> can be mapped to Partial<Http.CommentPayload>,
      // which is the case right now but may not be in the future.
      const response: Model.Comment = yield call(updateComment, id, data as Partial<Http.CommentPayload>, {
        cancelToken: source.token
      });
      yield put(updateCommentInStateAction({ id, data: response }));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error updating the comment.");
      }
    } finally {
      yield put(updatingCommentAction({ id, value: false }));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getSubAccountComments, subaccountId, { cancelToken: source.token });
      yield put(responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the sub account's comments.");
        yield put(responseCommentsAction({ count: 0, data: [] }, { error: e }));
      }
    } finally {
      yield put(loadingCommentsAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}
