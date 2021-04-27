import { ActionType } from "../../actions";
import { createStandardSaga } from "../factories";
import {
  getAccountsTask,
  handleUpdateTask,
  handleRemovalTask,
  deleteGroupTask,
  removeFromGroupTask,
  getGroupsTask,
  handleBulkUpdateTask,
  bulkCreateTask
} from "./tasks/accounts";

export default createStandardSaga({
  Request: {
    actionType: ActionType.Template.Accounts.Request,
    task: getAccountsTask
  },
  RequestGroups: {
    actionType: ActionType.Template.Accounts.Groups.Request,
    task: getGroupsTask
  },
  BulkUpdate: { actionType: ActionType.Template.BulkUpdate, task: handleBulkUpdateTask },
  BulkCreate: { actionType: ActionType.Template.BulkCreate, task: bulkCreateTask },
  Delete: { actionType: ActionType.Template.Accounts.Delete, task: handleRemovalTask },
  Update: { actionType: ActionType.Template.Accounts.Update, task: handleUpdateTask },
  DeleteGroup: { actionType: ActionType.Template.Accounts.Groups.Delete, task: deleteGroupTask },
  RemoveModelFromGroup: { actionType: ActionType.Template.Accounts.RemoveFromGroup, task: removeFromGroupTask }
});
