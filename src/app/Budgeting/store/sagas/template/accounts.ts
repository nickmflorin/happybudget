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
    request: actions.requestAccountsAction,
    response: actions.responseAccountsAction,
    addToState: actions.addAccountToStateAction,
    budget: {
      loading: loadingTemplateAction,
      updateInState: updateTemplateInStateAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  {
    getAccounts: api.getTemplateAccounts,
    getGroups: api.getTemplateAccountGroups,
    bulkUpdate: api.bulkUpdateTemplateAccounts,
    bulkCreate: api.bulkCreateTemplateAccounts,
    bulkDelete: api.bulkDeleteTemplateAccounts
  },
  (state: Modules.Authenticated.Store) => state.budget.template.budget.id,
  (state: Modules.Authenticated.Store) => state.budget.template.budget.table.data,
  (state: Modules.Authenticated.Store) => state.budget.template.autoIndex
);

export default createStandardSaga(
  {
    Request: ActionType.Template.Accounts.Request,
    TableChanged: ActionType.Template.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Template.Groups.Request
    }
  },
  tasks
);
