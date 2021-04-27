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
  deleteGroupTask,
  removeFromGroupTask,
  getGroupsTask,
  handleBulkUpdateTask,
  bulkCreateTask
} from "./tasks/subAccount";

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(handleSubAccountChangedTask, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccountTask, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Template.SubAccount.SubAccounts.Request,
      task: getSubAccountsTask
    },
    RequestGroups: {
      actionType: ActionType.Template.SubAccount.SubAccounts.Groups.Request,
      task: getGroupsTask
    },
    BulkUpdate: { actionType: ActionType.Template.SubAccount.BulkUpdate, task: handleBulkUpdateTask },
    BulkCreate: { actionType: ActionType.Template.SubAccount.BulkCreate, task: bulkCreateTask },
    Delete: { actionType: ActionType.Template.SubAccount.SubAccounts.Delete, task: handleRemovalTask },
    Update: { actionType: ActionType.Template.SubAccount.SubAccounts.Update, task: handleUpdateTask },
    DeleteGroup: { actionType: ActionType.Template.SubAccount.SubAccounts.Groups.Delete, task: deleteGroupTask },
    RemoveModelFromGroup: {
      actionType: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
      task: removeFromGroupTask
    }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);
