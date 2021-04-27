import { ActionType } from "../../actions";
import { createStandardSaga } from "../factories";
import {
  getAccountsTask,
  handleUpdateTask,
  handleRemovalTask,
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
} from "./tasks/accounts";

export default createStandardSaga({
  Request: {
    actionType: ActionType.Budget.Accounts.Request,
    task: getAccountsTask
  },
  RequestGroups: {
    actionType: ActionType.Budget.Accounts.Groups.Request,
    task: getGroupsTask
  },
  RequestComments: {
    actionType: ActionType.Budget.Comments.Request,
    task: getCommentsTask
  },
  RequestHistory: {
    actionType: ActionType.Budget.Accounts.History.Request,
    task: getHistoryTask
  },
  BulkUpdate: { actionType: ActionType.Budget.BulkUpdate, task: handleBulkUpdateTask },
  BulkCreate: { actionType: ActionType.Budget.BulkCreate, task: bulkCreateTask },
  Delete: { actionType: ActionType.Budget.Accounts.Delete, task: handleRemovalTask },
  Update: { actionType: ActionType.Budget.Accounts.Update, task: handleUpdateTask },
  SubmitComment: { actionType: ActionType.Budget.Comments.Create, task: submitCommentTask },
  DeleteComment: { actionType: ActionType.Budget.Comments.Delete, task: deleteCommentTask },
  EditComment: { actionType: ActionType.Budget.Comments.Update, task: editCommentTask },
  DeleteGroup: { actionType: ActionType.Budget.Accounts.Groups.Delete, task: deleteGroupTask },
  RemoveModelFromGroup: { actionType: ActionType.Budget.Accounts.RemoveFromGroup, task: removeFromGroupTask }
});
