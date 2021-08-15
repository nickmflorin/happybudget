import { SagaIterator } from "redux-saga";
import { take, call, cancel, spawn } from "redux-saga/effects";

import * as api from "api";
import { redux } from "lib";

import { ActionType } from "../../actions";
import { loadingTemplateAction, updateTemplateInStateAction } from "../../actions/template";
import * as actions from "../../actions/template/account";
import { createStandardSaga, createAccountTaskSet, createFringeTaskSet } from "../factories";

const tasks = createAccountTaskSet<Model.Template>(
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
      updateInState: updateTemplateInStateAction
    },
    account: {
      request: actions.requestAccountAction,
      response: actions.responseAccountAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.ApplicationStore) => state.budget.template.account.id,
  (state: Modules.ApplicationStore) => state.budget.template.account.table.data,
  (state: Modules.ApplicationStore) => state.budget.template.autoIndex
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

const fringesRootSaga = redux.sagas.factories.createTableSaga(
  {
    Request: ActionType.Template.Account.Fringes.Request,
    TableChanged: ActionType.Template.Account.Fringes.TableChanged
  },
  createFringeTaskSet<Model.Template>(
    {
      response: actions.responseFringesAction,
      loading: actions.loadingFringesAction,
      addToState: actions.addFringeToStateAction,
      deleting: actions.deletingFringeAction,
      creating: actions.creatingFringeAction,
      updating: actions.updatingFringeAction,
      budget: {
        loading: loadingTemplateAction,
        updateInState: updateTemplateInStateAction
      }
    },
    {
      request: api.getTemplateFringes,
      create: api.createTemplateFringe,
      bulkUpdate: api.bulkUpdateTemplateFringes,
      bulkCreate: api.bulkCreateTemplateFringes,
      bulkDelete: api.bulkDeleteTemplateFringes
    },
    (state: Modules.ApplicationStore) => state.budget.template.budget.id
  )
);

const rootAccountSaga = createStandardSaga(
  {
    Request: ActionType.Template.Account.SubAccounts.Request,
    TableChanged: ActionType.Template.Account.TableChanged,
    Groups: {
      Request: ActionType.Template.Account.Groups.Request
    }
  },
  tasks,
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);

export default function* rootSaga(): SagaIterator {
  yield spawn(rootAccountSaga);
  yield spawn(fringesRootSaga);
}
