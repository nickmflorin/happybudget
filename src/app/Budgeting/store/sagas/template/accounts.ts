import * as api from "api";

import { ActionType } from "../../actions";
import { requestTemplateAction, loadingTemplateAction } from "../../actions/template";
import * as actions from "../../actions/template/accounts";
import { createStandardSaga, createAccountsTaskSet } from "../factories";

const tasks = createAccountsTaskSet<Model.Template>(
  {
    loading: actions.loadingAccountsAction,
    deleting: actions.deletingAccountAction,
    creating: actions.creatingAccountAction,
    updating: actions.updatingAccountAction,
    response: actions.responseAccountsAction,
    addToState: actions.addAccountToStateAction,
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
  (state: Modules.ApplicationStore) => state.budgeting.template.template.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.accounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.template.autoIndex
);

export default createStandardSaga(
  {
    Request: ActionType.Template.Accounts.Request,
    TableChange: ActionType.Template.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Template.Accounts.Groups.Request,
      RemoveModel: ActionType.Template.Accounts.RemoveFromGroup,
      AddModel: ActionType.Template.Accounts.AddToGroup,
      Delete: ActionType.Template.Accounts.Groups.Delete
    }
  },
  {
    Request: tasks.getAccounts,
    HandleDataChangeEvent: tasks.handleDataChangeEvent,
    HandleRowAddEvent: tasks.handleRowAddEvent,
    HandleRowDeleteEvent: tasks.handleRowDeleteEvent,
    Groups: {
      Request: tasks.getGroups,
      RemoveModel: tasks.removeFromGroup,
      AddModel: tasks.addToGroup,
      Delete: tasks.deleteGroup
    }
  }
);
