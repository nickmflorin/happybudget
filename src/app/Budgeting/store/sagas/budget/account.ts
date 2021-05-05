import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel } from "redux-saga/effects";
import { isNil } from "lodash";

import { handleRequestError } from "api";
import {
  getAccountComments,
  createAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getAccountSubAccountsHistory
} from "api/services";

import { BudgetSubAccountRowManager } from "lib/tabling/managers";

import { ActionType } from "../../actions";
import { loadingTemplateAction, requestTemplateAction } from "../../actions/template";
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
  addSubAccountToStateAction,
  loadingHistoryAction,
  loadingCommentsAction,
  responseHistoryAction,
  responseCommentsAction,
  replyingToCommentAction,
  creatingCommentAction,
  addCommentToStateAction,
  deletingCommentAction,
  removeCommentFromStateAction,
  updatingCommentAction,
  updateCommentInStateAction
} from "../../actions/budget/account";
import { createStandardSaga, createAccountTaskSet } from "../factories";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingHistoryAction(true));
    try {
      const response: Http.ListResponse<Model.HistoryEvent> = yield call(
        getAccountSubAccountsHistory,
        accountId,
        {},
        { cancelToken: source.token }
      );
      yield put(responseHistoryAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account's sub accounts history.");
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
  const accountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId) && !isNil(action.payload)) {
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
        response = yield call(createAccountComment, accountId, data, { cancelToken: source.token });
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
  const accountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    yield put(loadingCommentsAction(true));
    try {
      // TODO: We will have to build in pagination.
      const response = yield call(getAccountComments, accountId, { cancelToken: source.token });
      yield put(responseCommentsAction(response));
    } catch (e) {
      if (!(yield cancelled())) {
        handleRequestError(e, "There was an error retrieving the account's comments.");
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

const tasks = createAccountTaskSet<
  Model.BudgetAccount,
  Model.BudgetSubAccount,
  Table.BudgetSubAccountRow,
  Model.BudgetGroup
>(
  {
    loading: loadingSubAccountsAction,
    deleting: deletingSubAccountAction,
    creating: creatingSubAccountAction,
    updating: updatingSubAccountAction,
    request: requestSubAccountsAction,
    response: responseSubAccountsAction,
    addToState: addSubAccountToStateAction,
    updateInState: updateSubAccountInStateAction,
    removeFromState: removeSubAccountFromStateAction,
    budget: {
      loading: loadingTemplateAction,
      request: requestTemplateAction
    },
    account: {
      request: requestAccountAction,
      loading: loadingAccountAction,
      response: responseAccountAction
    },
    groups: {
      deleting: deletingGroupAction,
      removeFromState: removeGroupFromStateAction,
      loading: loadingGroupsAction,
      response: responseGroupsAction,
      request: requestGroupsAction
    },
    addErrorsToState: addErrorsToStateAction
  },
  BudgetSubAccountRowManager,
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.id,
  (state: Redux.ApplicationStore) => state.budgeting.budget.account.subaccounts.data
);

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleAccountChange, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Budget.Account.SubAccounts.Request,
      task: tasks.getSubAccounts
    },
    RequestGroups: {
      actionType: ActionType.Budget.Account.SubAccounts.Groups.Request,
      task: tasks.getGroups
    },
    RequestComments: {
      actionType: ActionType.Budget.Account.Comments.Request,
      task: getCommentsTask
    },
    RequestHistory: {
      actionType: ActionType.Budget.Account.SubAccounts.History.Request,
      task: getHistoryTask
    },
    BulkUpdate: { actionType: ActionType.Budget.Account.BulkUpdate, task: tasks.handleBulkUpdate },
    BulkCreate: { actionType: ActionType.Budget.Account.BulkCreate, task: tasks.bulkCreate },
    Delete: { actionType: ActionType.Budget.Account.SubAccounts.Delete, task: tasks.handleRemoval },
    Update: { actionType: ActionType.Budget.Account.SubAccounts.Update, task: tasks.handleUpdate },
    SubmitComment: { actionType: ActionType.Budget.Account.Comments.Create, task: submitCommentTask },
    DeleteComment: { actionType: ActionType.Budget.Account.Comments.Delete, task: deleteCommentTask },
    EditComment: { actionType: ActionType.Budget.Account.Comments.Update, task: editCommentTask },
    DeleteGroup: { actionType: ActionType.Budget.Account.SubAccounts.Groups.Delete, task: tasks.deleteGroup },
    RemoveModelFromGroup: {
      actionType: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
      task: tasks.removeFromGroup
    },
    AddModelToGroup: {
      actionType: ActionType.Budget.Account.SubAccounts.AddToGroup,
      task: tasks.addToGroup
    }
  },
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);
