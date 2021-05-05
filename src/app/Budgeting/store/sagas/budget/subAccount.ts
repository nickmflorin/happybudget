import axios from "axios";
import { SagaIterator } from "redux-saga";
import { take, call, cancel, put, cancelled, select } from "redux-saga/effects";
import { isNil } from "lodash";

import { handleRequestError } from "api";
import {
  getSubAccountComments,
  createSubAccountComment,
  deleteComment,
  updateComment,
  replyToComment,
  getSubAccountSubAccountsHistory
} from "api/services";

import { BudgetSubAccountRowManager } from "lib/tabling/managers";

import { ActionType } from "../../actions";
import { loadingBudgetAction, requestBudgetAction } from "../../actions/budget";
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
} from "../../actions/budget/subAccount";

import { createStandardSaga, createSubAccountTaskSet } from "../factories";

export function* getHistoryTask(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.id);
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
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.id);
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
  const subaccountId = yield select((state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.id);
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

const tasks = createSubAccountTaskSet<Model.BudgetSubAccount, Table.BudgetSubAccountRow, Model.BudgetGroup>(
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
      loading: loadingBudgetAction,
      request: requestBudgetAction
    },
    subaccount: {
      request: requestSubAccountAction,
      loading: loadingSubAccountAction,
      response: responseSubAccountAction
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
  (state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.id,
  (state: Redux.ApplicationStore) => state.budgeting.budget.subaccount.subaccounts.data
);

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleSubAccountChange, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getSubAccount, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.Request,
      task: tasks.getSubAccounts
    },
    RequestGroups: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.Groups.Request,
      task: tasks.getGroups
    },
    RequestComments: {
      actionType: ActionType.Budget.SubAccount.Comments.Request,
      task: getCommentsTask
    },
    RequestHistory: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.History.Request,
      task: getHistoryTask
    },
    BulkUpdate: { actionType: ActionType.Budget.SubAccount.BulkUpdate, task: tasks.handleBulkUpdate },
    BulkCreate: { actionType: ActionType.Budget.SubAccount.BulkCreate, task: tasks.bulkCreate },
    Delete: { actionType: ActionType.Budget.SubAccount.SubAccounts.Delete, task: tasks.handleRemoval },
    Update: { actionType: ActionType.Budget.SubAccount.SubAccounts.Update, task: tasks.handleUpdate },
    SubmitComment: { actionType: ActionType.Budget.SubAccount.Comments.Create, task: submitCommentTask },
    DeleteComment: { actionType: ActionType.Budget.SubAccount.Comments.Delete, task: deleteCommentTask },
    EditComment: { actionType: ActionType.Budget.SubAccount.Comments.Update, task: editCommentTask },
    DeleteGroup: { actionType: ActionType.Budget.SubAccount.SubAccounts.Groups.Delete, task: tasks.deleteGroup },
    RemoveModelFromGroup: {
      actionType: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
      task: tasks.removeFromGroup
    },
    AddModelToGroup: { actionType: ActionType.Budget.Account.SubAccounts.AddToGroup, task: tasks.addToGroup }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);
