import {
  getTemplateAccounts,
  getTemplateAccountGroups,
  bulkUpdateTemplateAccounts,
  bulkCreateTemplateAccounts
} from "api/services";
import { TemplateAccountRowManager } from "lib/tabling/managers";

import { ActionType } from "../../actions";
import { requestTemplateAction, loadingTemplateAction } from "../../actions/template";
import {
  loadingAccountsAction,
  responseAccountsAction,
  deletingAccountAction,
  creatingAccountAction,
  updatingAccountAction,
  deletingGroupAction,
  removeGroupFromStateAction,
  updateAccountInStateAction,
  removeAccountFromStateAction,
  addErrorsToStateAction,
  loadingGroupsAction,
  responseGroupsAction,
  addAccountToStateAction
} from "../../actions/template/accounts";
import { createStandardSaga, createAccountsTaskSet } from "../factories";

const tasks = createAccountsTaskSet<
  Model.Template,
  Model.TemplateAccount,
  Table.TemplateAccountRow,
  Model.TemplateGroup,
  Http.TemplateAccountPayload
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
      loading: loadingTemplateAction,
      request: requestTemplateAction
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
    getAccounts: getTemplateAccounts,
    getGroups: getTemplateAccountGroups,
    bulkUpdate: bulkUpdateTemplateAccounts,
    bulkCreate: bulkCreateTemplateAccounts
  },
  TemplateAccountRowManager,
  (state: Redux.ApplicationStore) => state.budgeting.template.template.id,
  (state: Redux.ApplicationStore) => state.budgeting.template.accounts.data
);

export default createStandardSaga({
  Request: {
    actionType: ActionType.Template.Accounts.Request,
    task: tasks.getAccounts
  },
  RequestGroups: {
    actionType: ActionType.Template.Accounts.Groups.Request,
    task: tasks.getGroups
  },
  BulkUpdate: { actionType: ActionType.Template.BulkUpdate, task: tasks.handleBulkUpdate },
  BulkCreate: { actionType: ActionType.Template.BulkCreate, task: tasks.bulkCreate },
  Delete: { actionType: ActionType.Template.Accounts.Delete, task: tasks.handleRemoval },
  Update: { actionType: ActionType.Template.Accounts.Update, task: tasks.handleUpdate },
  DeleteGroup: { actionType: ActionType.Template.Accounts.Groups.Delete, task: tasks.deleteGroup },
  RemoveModelFromGroup: { actionType: ActionType.Template.Accounts.RemoveFromGroup, task: tasks.removeFromGroup },
  AddModelToGroup: { actionType: ActionType.Template.Accounts.AddToGroup, task: tasks.addToGroup }
});
