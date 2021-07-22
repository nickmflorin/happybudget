import * as api from "api";

import { ActionType } from "../../actions";
import { loadingTemplateAction, updateTemplateInStateAction } from "../../actions/template";
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
      updateInState: updateTemplateInStateAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
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
  (state: Modules.ApplicationStore) => state.budget.template.budget.id,
  (state: Modules.ApplicationStore) => state.budget.template.budget.children.data,
  (state: Modules.ApplicationStore) => state.budget.template.autoIndex
);

export default createStandardSaga(
  {
    Request: ActionType.Template.Accounts.Request,
    TableChange: ActionType.Template.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Template.Groups.Request
    }
  },
  {
    Request: tasks.getAccounts,
    handleDataChangeEvent: tasks.handleDataChangeEvent,
    handleRowAddEvent: tasks.handleRowAddEvent,
    handleRowDeleteEvent: tasks.handleRowDeleteEvent,
    handleAddRowToGroupEvent: tasks.handleAddRowToGroupEvent,
    handleRemoveRowFromGroupEvent: tasks.handleRemoveRowFromGroupEvent,
    handleDeleteGroupEvent: tasks.handleDeleteGroupEvent,
    Groups: {
      Request: tasks.getGroups
    }
  }
);
