import { SagaIterator } from "redux-saga";
import { take, call, cancel } from "redux-saga/effects";

import * as models from "lib/model";

import { ActionType } from "../../actions";
import { loadingTemplateAction, requestTemplateAction } from "../../actions/template";
import * as actions from "../../actions/template/subAccount";

import { createStandardSaga, createSubAccountTaskSet } from "../factories";

const tasks = createSubAccountTaskSet<Model.TemplateSubAccount, BudgetTable.TemplateSubAccountRow, Model.TemplateGroup>(
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
    subaccount: {
      request: actions.requestSubAccountAction,
      loading: actions.loadingSubAccountAction,
      response: actions.responseSubAccountAction
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
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.subaccounts.data,
  (state: Modules.ApplicationStore) => state.budgeting.template.autoIndex
);

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleSubAccountChange, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getSubAccount, action);
  }
}

export default createStandardSaga(
  {
    Request: {
      actionType: ActionType.Template.SubAccount.SubAccounts.Request,
      task: tasks.getSubAccounts
    },
    RequestGroups: {
      actionType: ActionType.Template.SubAccount.SubAccounts.Groups.Request,
      task: tasks.getGroups
    },
    TableChanged: { actionType: ActionType.Template.SubAccount.TableChanged, task: tasks.handleTableChange },
    BulkCreate: { actionType: ActionType.Template.SubAccount.SubAccounts.BulkCreate, task: tasks.bulkCreate },
    Delete: { actionType: ActionType.Template.SubAccount.SubAccounts.Delete, task: tasks.handleRemoval },
    DeleteGroup: { actionType: ActionType.Template.SubAccount.SubAccounts.Groups.Delete, task: tasks.deleteGroup },
    RemoveModelFromGroup: {
      actionType: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
      task: tasks.removeFromGroup
    },
    AddModelToGroup: { actionType: ActionType.Template.Account.SubAccounts.AddToGroup, task: tasks.addToGroup }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);
