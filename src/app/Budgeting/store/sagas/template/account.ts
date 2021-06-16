import { SagaIterator } from "redux-saga";
import { take, call, cancel } from "redux-saga/effects";

import * as models from "lib/model";

import { ActionType } from "../../actions";
import { loadingTemplateAction, requestTemplateAction } from "../../actions/template";
import * as actions from "../../actions/template/account";
import { createStandardSaga, createAccountTaskSet } from "../factories";

const tasks = createAccountTaskSet<
  Model.TemplateAccount,
  Model.TemplateSubAccount,
  BudgetTable.TemplateSubAccountRow,
  Model.TemplateGroup
>(
  {
    loading: actions.loadingSubAccountsAction,
    deleting: actions.deletingSubAccountAction,
    creating: actions.creatingSubAccountAction,
    updating: actions.updatingSubAccountAction,
    request: actions.requestSubAccountsAction,
    response: actions.responseSubAccountsAction,
    addToState: actions.addSubAccountToStateAction,
    updateInState: actions.updateSubAccountInStateAction,
    removeFromState: actions.removeSubAccountFromStateAction,
    budget: {
      loading: loadingTemplateAction,
      request: requestTemplateAction
    },
    account: {
      request: actions.requestAccountAction,
      loading: actions.loadingAccountAction,
      response: actions.responseAccountAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      removeFromState: actions.removeGroupFromStateAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  models.TemplateSubAccountRowManager,
  (state: Modules.ApplicationStore) => state.budgeting.template.account.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.account.subaccounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.template.autoIndex
);

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleAccountChange, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Template.Account.SubAccounts.Request,
      task: tasks.getSubAccounts
    },
    RequestGroups: {
      actionType: ActionType.Template.Account.SubAccounts.Groups.Request,
      task: tasks.getGroups
    },
    TableChanged: { actionType: ActionType.Template.Account.TableChanged, task: tasks.handleTableChange },
    BulkCreate: { actionType: ActionType.Template.Account.SubAccounts.BulkCreate, task: tasks.bulkCreate },
    Delete: { actionType: ActionType.Template.Account.SubAccounts.Delete, task: tasks.handleRemoval },
    DeleteGroup: { actionType: ActionType.Template.Account.SubAccounts.Groups.Delete, task: tasks.deleteGroup },
    RemoveModelFromGroup: {
      actionType: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
      task: tasks.removeFromGroup
    },
    AddModelToGroup: { actionType: ActionType.Template.Account.SubAccounts.AddToGroup, task: tasks.addToGroup }
  },
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);
