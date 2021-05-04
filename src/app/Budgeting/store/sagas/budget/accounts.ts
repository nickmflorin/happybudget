import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled } from "redux-saga/effects";
import { isNil } from "lodash";

import { handleRequestError } from "api";
import {
  getBudgetAccounts,
  getBudgetComments,
  createBudgetComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountsHistory,
  getBudgetAccountGroups,
  bulkUpdateBudgetAccounts,
  bulkCreateBudgetAccounts
} from "api/services";

import { userToSimpleUser } from "lib/model/mappings";
import { nowAsString } from "lib/util/dates";
import { generateRandomNumericId } from "lib/util";
import { BudgetAccountRowManager } from "lib/tabling/managers";

import { ActionType } from "../../actions";
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
  addErrorsToStateAction,
  loadingGroupsAction,
  responseGroupsAction,
  addAccountToStateAction
} from "../../actions/budget/accounts";
import { createStandardSaga, createAccountsTaskSet } from "../factories";

export function* getCommentsTask(action: Redux.Action<any>): SagaIterator {
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
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
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
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
  const budgetId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.budget.id);
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

const tasks = createAccountsTaskSet<
  Model.Budget,
  Model.BudgetAccount,
  Table.BudgetAccountRow,
  Model.BudgetGroup,
  Http.BudgetAccountPayload
>(
  {
    loading: loadingAccountsAction,
    deleting: deletingAccountAction,
    creating: creatingAccountAction,
    updating: updatingAccountAction,
    response: responseAccountsAction,
    addToState: addAccountToStateAction,
    updateInState: updateAccountInStateAction,
    removeFromState: removeAccountFromStateAction,
    budget: {
      loading: loadingBudgetAction,
      request: requestBudgetAction
    },
    groups: {
      deleting: deletingGroupAction,
      removeFromState: removeGroupFromStateAction,
      loading: loadingGroupsAction,
      response: responseGroupsAction
    },
    addErrorsToState: addErrorsToStateAction
  },
  {
    getAccounts: getBudgetAccounts,
    getGroups: getBudgetAccountGroups,
    bulkUpdate: bulkUpdateBudgetAccounts,
    bulkCreate: bulkCreateBudgetAccounts
  },
  BudgetAccountRowManager,
  (state: Redux.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Redux.ApplicationStore) => state.budgeting.budget.accounts.data
);

export default createStandardSaga({
  Request: {
    actionType: ActionType.Budget.Accounts.Request,
    task: tasks.getAccounts
  },
  RequestGroups: {
    actionType: ActionType.Budget.Accounts.Groups.Request,
    task: tasks.getGroups
  },
  RequestComments: {
    actionType: ActionType.Budget.Comments.Request,
    task: getCommentsTask
  },
  RequestHistory: {
    actionType: ActionType.Budget.Accounts.History.Request,
    task: getHistoryTask
  },
  BulkUpdate: { actionType: ActionType.Budget.BulkUpdate, task: tasks.handleBulkUpdate },
  BulkCreate: { actionType: ActionType.Budget.BulkCreate, task: tasks.bulkCreate },
  Delete: { actionType: ActionType.Budget.Accounts.Delete, task: tasks.handleRemoval },
  Update: { actionType: ActionType.Budget.Accounts.Update, task: tasks.handleUpdate },
  SubmitComment: { actionType: ActionType.Budget.Comments.Create, task: submitCommentTask },
  DeleteComment: { actionType: ActionType.Budget.Comments.Delete, task: deleteCommentTask },
  EditComment: { actionType: ActionType.Budget.Comments.Update, task: editCommentTask },
  DeleteGroup: { actionType: ActionType.Budget.Accounts.Groups.Delete, task: tasks.deleteGroup },
  RemoveModelFromGroup: { actionType: ActionType.Budget.Accounts.RemoveFromGroup, task: tasks.removeFromGroup }
});
