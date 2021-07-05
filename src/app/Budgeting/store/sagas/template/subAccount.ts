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
    Request: ActionType.Template.SubAccount.SubAccounts.Request,
    TableChange: ActionType.Template.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Template.SubAccount.SubAccounts.Groups.Request,
      RemoveModel: ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup,
      AddModel: ActionType.Template.SubAccount.SubAccounts.AddToGroup,
      Delete: ActionType.Template.SubAccount.SubAccounts.Groups.Delete
    }
  },
  {
    Request: tasks.getSubAccounts,
    HandleDataChangeEvent: tasks.handleDataChangeEvent,
    HandleRowAddEvent: tasks.handleRowAddEvent,
    HandleRowDeleteEvent: tasks.handleRowDeleteEvent,
    Groups: {
      Request: tasks.getGroups,
      RemoveModel: tasks.removeFromGroup,
      AddModel: tasks.addToGroup,
      Delete: tasks.deleteGroup
    }
  },
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);
