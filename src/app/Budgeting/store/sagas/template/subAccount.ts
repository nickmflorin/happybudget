import { SagaIterator } from "redux-saga";
import { take, call, cancel, spawn } from "redux-saga/effects";

import * as api from "api";
import * as models from "lib/model";

import { ActionType } from "../../actions";
import { loadingTemplateAction, requestTemplateAction } from "../../actions/template";
import * as actions from "../../actions/template/subAccount";

import {
  createStandardSaga,
  createStandardFringesSaga,
  createSubAccountTaskSet,
  createFringeTaskSet
} from "../factories";

const tasks = createSubAccountTaskSet<Model.SubAccount, BudgetTable.SubAccountRow, Model.Group>(
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
  models.SubAccountRowManager,
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

const fringeTasks = createFringeTaskSet<Model.Template>(
  {
    response: actions.responseFringesAction,
    loading: actions.loadingFringesAction,
    addToState: actions.addFringeToStateAction,
    deleting: actions.deletingFringeAction,
    creating: actions.creatingFringeAction,
    updating: actions.updatingFringeAction,
    requestBudget: requestTemplateAction
  },
  {
    request: api.getTemplateFringes,
    create: api.createTemplateFringe,
    bulkUpdate: api.bulkUpdateTemplateFringes,
    bulkCreate: api.bulkCreateTemplateFringes,
    bulkDelete: api.bulkDeleteTemplateFringes
  },
  (state: Modules.ApplicationStore) => state.budgeting.template.template.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.subaccount.fringes.data
);

const fringesRootSaga = createStandardFringesSaga(
  {
    Request: ActionType.Template.SubAccount.Fringes.Request,
    TableChanged: ActionType.Template.SubAccount.Fringes.TableChanged
  },
  fringeTasks
);

const rootSubAccountSaga = createStandardSaga(
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

export default function* rootSaga(): SagaIterator {
  yield spawn(rootSubAccountSaga);
  yield spawn(fringesRootSaga);
}
