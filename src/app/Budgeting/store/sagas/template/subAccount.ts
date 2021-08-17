import { SagaIterator } from "redux-saga";
import { take, call, cancel, spawn } from "redux-saga/effects";

import * as api from "api";
import { redux } from "lib";

import { ActionType } from "../../actions";
import { loadingTemplateAction, updateTemplateInStateAction } from "../../actions/template";
import * as actions from "../../actions/template/subAccount";

import { createStandardSaga, createSubAccountTaskSet, createFringeTaskSet } from "../factories";

const tasks = createSubAccountTaskSet<Model.Template>(
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
    subaccount: {
      request: actions.requestSubAccountAction,
      response: actions.responseSubAccountAction
    },
    groups: {
      deleting: actions.deletingGroupAction,
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.id,
  (state: Modules.Authenticated.Store) => state.budget.template.subaccount.table.data,
  (state: Modules.Authenticated.Store) => state.budget.template.autoIndex
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

const fringesRootSaga = redux.sagas.factories.createTableSaga(
  {
    Request: ActionType.Template.SubAccount.Fringes.Request,
    TableChanged: ActionType.Template.SubAccount.Fringes.TableChanged
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
    (state: Modules.Authenticated.Store) => state.budget.template.budget.id
  )
);

const rootSubAccountSaga = createStandardSaga(
  {
    Request: ActionType.Template.SubAccount.SubAccounts.Request,
    TableChanged: ActionType.Template.SubAccount.TableChanged,
    Groups: {
      Request: ActionType.Template.SubAccount.Groups.Request
    }
  },
  tasks,
  watchForRequestSubAccountSaga,
  watchForSubAccountIdChangedSaga
);

export default function* rootSaga(): SagaIterator {
  yield spawn(rootSubAccountSaga);
  yield spawn(fringesRootSaga);
}
