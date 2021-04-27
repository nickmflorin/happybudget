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
  deleteGroupTask,
  removeFromGroupTask,
  bulkCreateTask,
  getGroupsTask,
  handleBulkUpdateTask
} from "./tasks/account";

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccountTask, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleAccountChangedTask, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Template.Account.SubAccounts.Request,
      task: getSubAccountsTask
    },
    RequestGroups: {
      actionType: ActionType.Template.Account.SubAccounts.Groups.Request,
      task: getGroupsTask
    },
    BulkUpdate: { actionType: ActionType.Template.Account.BulkUpdate, task: handleBulkUpdateTask },
    BulkCreate: { actionType: ActionType.Template.Account.BulkCreate, task: bulkCreateTask },
    Delete: { actionType: ActionType.Template.Account.SubAccounts.Delete, task: handleRemovalTask },
    Update: { actionType: ActionType.Template.Account.SubAccounts.Update, task: handleUpdateTask },
    DeleteGroup: { actionType: ActionType.Template.Account.SubAccounts.Groups.Delete, task: deleteGroupTask },
    RemoveModelFromGroup: {
      actionType: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
      task: removeFromGroupTask
    }
  },
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);
