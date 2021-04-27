import { SagaIterator } from "redux-saga";
import { take, call, cancel } from "redux-saga/effects";
import { ActionType } from "../../actions";
import { createStandardSaga } from "../factories";
import {
  getAccountTask,
  getSubAccountsTask,
  handleUpdateTask,
  handleRemovalTask,
  handleAccountChangedTask,
  getCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editCommentTask,
  getHistoryTask,
  deleteGroupTask,
  removeFromGroupTask,
  bulkCreateTask,
  getGroupsTask,
  handleBulkUpdateTask
} from "./tasks/account";

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountTask, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleAccountChangedTask, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Budget.Account.SubAccounts.Request,
      task: getSubAccountsTask
    },
    RequestGroups: {
      actionType: ActionType.Budget.Account.SubAccounts.Groups.Request,
      task: getGroupsTask
    },
    RequestComments: {
      actionType: ActionType.Budget.Account.Comments.Request,
      task: getCommentsTask
    },
    RequestHistory: {
      actionType: ActionType.Budget.Account.SubAccounts.History.Request,
      task: getHistoryTask
    },
    BulkUpdate: { actionType: ActionType.Budget.Account.BulkUpdate, task: handleBulkUpdateTask },
    BulkCreate: { actionType: ActionType.Budget.Account.BulkCreate, task: bulkCreateTask },
    Delete: { actionType: ActionType.Budget.Account.SubAccounts.Delete, task: handleRemovalTask },
    Update: { actionType: ActionType.Budget.Account.SubAccounts.Update, task: handleUpdateTask },
    SubmitComment: { actionType: ActionType.Budget.Account.Comments.Create, task: submitCommentTask },
    DeleteComment: { actionType: ActionType.Budget.Account.Comments.Delete, task: deleteCommentTask },
    EditComment: { actionType: ActionType.Budget.Account.Comments.Update, task: editCommentTask },
    DeleteGroup: { actionType: ActionType.Budget.Account.SubAccounts.Groups.Delete, task: deleteGroupTask },
    RemoveModelFromGroup: {
      actionType: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
      task: removeFromGroupTask
    }
  },
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);
