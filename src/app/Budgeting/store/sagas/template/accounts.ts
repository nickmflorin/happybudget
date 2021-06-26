import * as api from "api";
import * as models from "lib/model";

import { ActionType } from "../../actions";
import { requestTemplateAction, loadingTemplateAction } from "../../actions/template";
import * as actions from "../../actions/template/accounts";
import { createStandardSaga, createAccountsTaskSet } from "../factories";

const tasks = createAccountsTaskSet<
  Model.Template,
  Model.TemplateAccount,
  BudgetTable.TemplateAccountRow,
  Model.TemplateGroup,
  Http.TemplateAccountPayload
>(
  {
    loading: actions.loadingAccountsAction,
    deleting: actions.deletingAccountAction,
    creating: actions.creatingAccountAction,
    updating: actions.updatingAccountAction,
    response: actions.responseAccountsAction,
    addToState: actions.addAccountToStateAction,
    removeFromState: actions.removeAccountFromStateAction,
    budget: {
      loading: loadingTemplateAction,
      request: requestTemplateAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      removeFromState: actions.removeGroupFromStateAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction
    }
  },
  {
    getAccounts: api.getTemplateAccounts,
    getGroups: api.getTemplateAccountGroups,
    bulkUpdate: api.bulkUpdateTemplateAccounts,
    bulkCreate: api.bulkCreateTemplateAccounts,
    bulkDelete: api.bulkDeleteTemplateAccounts
  },
  models.TemplateAccountRowManager,
  (state: Modules.ApplicationStore) => state.budgeting.template.template.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.template.autoIndex
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
  TableChanged: { actionType: ActionType.Template.Accounts.TableChanged, task: tasks.handleTableChange },
  BulkCreate: { actionType: ActionType.Template.Accounts.BulkCreate, task: tasks.bulkCreate },
  Delete: { actionType: ActionType.Template.Accounts.Delete, task: tasks.handleRemoval },
  DeleteGroup: { actionType: ActionType.Template.Accounts.Groups.Delete, task: tasks.deleteGroup },
  RemoveModelFromGroup: { actionType: ActionType.Template.Accounts.RemoveFromGroup, task: tasks.removeFromGroup },
  AddModelToGroup: { actionType: ActionType.Template.Accounts.AddToGroup, task: tasks.addToGroup }
});
