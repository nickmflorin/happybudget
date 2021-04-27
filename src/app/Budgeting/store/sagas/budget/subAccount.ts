import { SagaIterator } from "redux-saga";
import { take, call, cancel } from "redux-saga/effects";

import { ActionType } from "../../actions";
import { createStandardSaga } from "../factories";
import {
  getSubAccountTask,
  getSubAccountsTask,
  handleUpdateTask,
  handleRemovalTask,
  handleSubAccountChangedTask,
  getCommentsTask,
  submitCommentTask,
  deleteCommentTask,
  editCommentTask,
  getHistoryTask,
  deleteGroupTask,
  removeFromGroupTask,
  getGroupsTask,
  handleBulkUpdateTask,
  bulkCreateTask
} from "./tasks/subAccount";

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleSubAccountChangedTask, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountTask, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.Request,
      task: getSubAccountsTask
    },
    RequestGroups: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.Groups.Request,
      task: getGroupsTask
    },
    RequestComments: {
      actionType: ActionType.Budget.SubAccount.Comments.Request,
      task: getCommentsTask
    },
    RequestHistory: {
      actionType: ActionType.Budget.SubAccount.SubAccounts.History.Request,
      task: getHistoryTask
    },
    BulkUpdate: { actionType: ActionType.Budget.SubAccount.BulkUpdate, task: handleBulkUpdateTask },
    BulkCreate: { actionType: ActionType.Budget.SubAccount.BulkCreate, task: bulkCreateTask },
    Delete: { actionType: ActionType.Budget.SubAccount.SubAccounts.Delete, task: handleRemovalTask },
    Update: { actionType: ActionType.Budget.SubAccount.SubAccounts.Update, task: handleUpdateTask },
    SubmitComment: { actionType: ActionType.Budget.SubAccount.Comments.Create, task: submitCommentTask },
    DeleteComment: { actionType: ActionType.Budget.SubAccount.Comments.Delete, task: deleteCommentTask },
    EditComment: { actionType: ActionType.Budget.SubAccount.Comments.Update, task: editCommentTask },
    DeleteGroup: { actionType: ActionType.Budget.SubAccount.SubAccounts.Groups.Delete, task: deleteGroupTask },
    RemoveModelFromGroup: {
      actionType: ActionType.Budget.Account.SubAccounts.RemoveFromGroup,
      task: removeFromGroupTask
    }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);
