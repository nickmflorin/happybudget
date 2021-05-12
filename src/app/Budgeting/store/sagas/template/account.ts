import { SagaIterator } from "redux-saga";
import { take, call, cancel } from "redux-saga/effects";

import { TemplateSubAccountRowManager } from "lib/tabling/managers";

import { ActionType } from "../../actions";
import { loadingTemplateAction, requestTemplateAction } from "../../actions/template";
import {
  loadingAccountAction,
  responseAccountAction,
  loadingSubAccountsAction,
  responseSubAccountsAction,
  deletingSubAccountAction,
  creatingSubAccountAction,
  updatingSubAccountAction,
  addErrorsToStateAction,
  requestSubAccountsAction,
  requestAccountAction,
  deletingGroupAction,
  removeGroupFromStateAction,
  updateSubAccountInStateAction,
  removeSubAccountFromStateAction,
  requestGroupsAction,
  responseGroupsAction,
  loadingGroupsAction,
  addSubAccountToStateAction
} from "../../actions/template/account";
import { createStandardSaga, createAccountTaskSet } from "../factories";

const tasks = createAccountTaskSet<
  Model.TemplateAccount,
  Model.TemplateSubAccount,
  Table.TemplateSubAccountRow,
  Model.TemplateGroup
>(
  {
    loading: loadingSubAccountsAction,
    deleting: deletingSubAccountAction,
    creating: creatingSubAccountAction,
    updating: updatingSubAccountAction,
    request: requestSubAccountsAction,
    response: responseSubAccountsAction,
    addToState: addSubAccountToStateAction,
    updateInState: updateSubAccountInStateAction,
    removeFromState: removeSubAccountFromStateAction,
    budget: {
      loading: loadingTemplateAction,
      request: requestTemplateAction
    },
    account: {
      request: requestAccountAction,
      loading: loadingAccountAction,
      response: responseAccountAction
    },
    groups: {
      deleting: deletingGroupAction,
      removeFromState: removeGroupFromStateAction,
      loading: loadingGroupsAction,
      response: responseGroupsAction,
      request: requestGroupsAction
    },
    addErrorsToState: addErrorsToStateAction
  },
  TemplateSubAccountRowManager,
  (state: Redux.ApplicationStore) => state.budgeting.template.account.id,
  (state: Redux.ApplicationStore) => state.budgeting.template.account.subaccounts.data,
  (state: Redux.ApplicationStore) => state.budgeting.template.autoIndex
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
    BulkUpdate: { actionType: ActionType.Template.Account.BulkUpdate, task: tasks.handleBulkUpdate },
    BulkCreate: { actionType: ActionType.Template.Account.BulkCreate, task: tasks.bulkCreate },
    Delete: { actionType: ActionType.Template.Account.SubAccounts.Delete, task: tasks.handleRemoval },
    Update: { actionType: ActionType.Template.Account.SubAccounts.Update, task: tasks.handleUpdate },
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
