import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled } from "redux-saga/effects";
import { isNil, find, map, groupBy } from "lodash";

import { handleRequestError } from "api";
import {
  getBudgetAccounts,
  deleteAccount,
  updateAccount,
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
import { warnInconsistentState } from "lib/redux/util";
import { isAction } from "lib/redux/typeguards";
import { BudgetAccountRowManager } from "lib/tabling/managers";
import { mergeRowChanges } from "lib/tabling/util";

import { requestBudgetAction, loadingBudgetAction } from "../../../actions/budget";
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
  addErrorsToStateAction,
  loadingGroupsAction,
  responseGroupsAction,
  addAccountToStateAction
} from "../../../actions/budget/accounts";

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
  // otherwise, the loading indicators will not appear until `yield put(requestBudgetAction)`, and there
  // is a lag between the time that this task is called and that task is called.
  yield put(loadingBudgetAction(true));
  let success = true;
  try {
    yield call(deleteAccount, id, { cancelToken: source.token });
  } catch (e) {
    success = false;
    yield put(loadingBudgetAction(false));
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
    yield put(requestBudgetAction(null));
  }
}

export function* updateTask(id: number, change: Table.RowChange<Table.BudgetAccountRow>): SagaIterator {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  yield put(updatingAccountAction({ id, value: true }));
  try {
    yield call(updateAccount, id, BudgetAccountRowManager.payload(change), { cancelToken: source.token });
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

export function* bulkUpdateTask(changes: Table.RowChange<Table.BudgetAccountRow>[]): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
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
      yield call(bulkUpdateBudgetAccounts, budgetId, requestPayload, { cancelToken: source.token });
    } catch (e) {
      // Once we rebuild back in the error handling, we will have to be concerned here with the nested
      // structure of the errors.
      if (!(yield cancelled())) {
        yield call(
          handleTableErrors,
          e,
          "There was an error updating the accounts.",
          budgetId,
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
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && (!isAction(action) || !isNil(action.payload))) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(creatingAccountAction(true));
    try {
      const accounts: Model.BudgetAccount[] = yield call(
        bulkCreateBudgetAccounts,
        budgetId,
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
          budgetId,
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
    const models: Model.BudgetAccount[] = yield select((state: Redux.ApplicationStore) => state.budget.accounts.data);
    const model: Model.BudgetAccount | undefined = find(models, { id: action.payload });
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

export function* handleBulkUpdateTask(action: Redux.Action<Table.RowChange<Table.BudgetAccountRow>[]>): SagaIterator {
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
    const mergedUpdates: Table.RowChange<Table.BudgetAccountRow>[] = [];

    for (let i = 0; i < merged.length; i++) {
      const model: Model.BudgetAccount | undefined = find(data, { id: merged[i].id });
      if (isNil(model)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state when it is expected to.",
          id: merged[i].id
        });
      } else {
        const updatedModel = BudgetAccountRowManager.mergeChangesWithModel(model, merged[i]);
        yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
        mergedUpdates.push(merged[i]);
      }
    }
    if (mergedUpdates.length !== 0) {
      yield fork(bulkUpdateTask, mergedUpdates);
    }
  }
}

export function* handleUpdateTask(action: Redux.Action<Table.RowChange<Table.BudgetAccountRow>>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const id = action.payload.id;
    const data: Model.BudgetAccount[] = yield select((state: Redux.ApplicationStore) => state.budget.accounts.data);
    const model: Model.BudgetAccount | undefined = find(data, { id });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Account does not exist in state when it is expected to.",
        id: action.payload.id
      });
    } else {
      const updatedModel = BudgetAccountRowManager.mergeChangesWithModel(model, action.payload);
      yield put(updateAccountInStateAction({ id: updatedModel.id, data: updatedModel }));
      yield call(updateTask, model.id, action.payload);
    }
  }
}

export function* getGroupsTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingGroupsAction(true));
    try {
      const response: Http.ListResponse<Model.BudgetGroup> = yield call(
        getBudgetAccountGroups,
        budgetId,
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
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingAccountsAction(true));
    try {
      const response = yield call(getBudgetAccounts, budgetId, { no_pagination: true }, { cancelToken: source.token });
      yield put(responseAccountsAction(response));
      if (response.data.length === 0) {
        yield call(bulkCreateTask, 2);
      }
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the budget's accounts.");
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

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getBudgetComments, budgetId, { cancelToken: source.token });
      yield put(responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the budget's comments.");
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

export function* submitCommentTask(action: Redux.Action<{ parent?: number; data: Http.CommentPayload }>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId) && !isNil(action.payload)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const { parent, data } = action.payload;
    if (!isNil(parent)) {
      yield put(replyingToCommentAction({ id: parent, value: true }));
    } else {
      yield put(creatingCommentAction(true));
    }
    try {
      let response: Comment;
      if (!isNil(parent)) {
        response = yield call(replyToComment, parent, data.text, { cancelToken: source.token });
      } else {
        response = yield call(createBudgetComment, budgetId, data, { cancelToken: source.token });
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

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budget.budget.id);
  if (!isNil(budgetId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingAccountsHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        getAccountsHistory,
        budgetId,
        {},
        { cancelToken: source.token }
      );
      yield put(responseAccountsHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the accounts history.");
      }
    } finally {
      yield put(loadingAccountsHistoryAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
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
