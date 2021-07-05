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
    Request: ActionType.Template.Account.SubAccounts.Request,
    TableChange: ActionType.Template.Account.TableChanged,
    Groups: {
      Request: ActionType.Template.Account.SubAccounts.Groups.Request,
      RemoveModel: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
      AddModel: ActionType.Template.Account.SubAccounts.AddToGroup,
      Delete: ActionType.Template.Account.SubAccounts.Groups.Delete
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
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);
