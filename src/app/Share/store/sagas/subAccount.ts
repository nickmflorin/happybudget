import { SagaIterator } from "redux-saga";
import { call, take, cancel, spawn } from "redux-saga/effects";

import * as api from "api";
import { redux } from "lib";

import ActionType, { loadingBudgetAction } from "../actions";
import * as actions from "../actions/subAccount";
import { createStandardSaga, createSubAccountTaskSet, createFringeTaskSet } from "./factories";

const fringesRootSaga = redux.sagas.factories.createReadOnlyTableSaga(
  { Request: ActionType.Budget.SubAccount.Fringes.Request },
  createFringeTaskSet(
    {
      response: actions.responseFringesAction,
      loading: actions.loadingFringesAction,
      budget: { loading: loadingBudgetAction }
    },
    { request: api.getBudgetFringes },
    (state: Modules.Unauthenticated.Store) => state.share.budget.id
  )
);

const tasks = createSubAccountTaskSet(
  {
    loading: actions.loadingSubAccountsAction,
    request: actions.requestSubAccountsAction,
    response: actions.responseSubAccountsAction,
    budget: { loading: loadingBudgetAction },
    subaccount: {
      request: actions.requestSubAccountAction,
      response: actions.responseSubAccountAction
    },
    groups: {
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.Unauthenticated.Store) => state.share.subaccount.id
);

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleSubAccountChange, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getSubAccount, action);
  }
}

const rootSubAccountSaga = createStandardSaga(
  {
    Request: ActionType.Budget.SubAccount.SubAccounts.Request,
    Groups: {
      Request: ActionType.Budget.SubAccount.Groups.Request
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
