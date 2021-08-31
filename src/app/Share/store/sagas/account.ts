import { SagaIterator } from "redux-saga";
import { call, take, cancel, spawn } from "redux-saga/effects";

import * as api from "api";
import { redux } from "lib";

import ActionType, { loadingBudgetAction } from "../actions";
import * as actions from "../actions/account";
import { createStandardSaga, createAccountTaskSet, createFringeTaskSet } from "./factories";

const fringesRootSaga = redux.sagas.factories.createReadOnlyTableSaga(
  { Request: ActionType.Budget.Account.Fringes.Request },
  createFringeTaskSet(
    {
      response: actions.responseFringesAction,
      loading: actions.loadingFringesAction,
      budget: { loading: loadingBudgetAction }
    },
    { request: api.getBudgetFringes },
    (state: Modules.Unauthenticated.StoreObj) => state.share.budget.id
  )
);

const tasks = createAccountTaskSet(
  {
    loading: actions.loadingSubAccountsAction,
    request: actions.requestSubAccountsAction,
    response: actions.responseSubAccountsAction,
    budget: {
      loading: loadingBudgetAction
    },
    account: {
      request: actions.requestAccountAction,
      response: actions.responseAccountAction
    },
    groups: {
      loading: actions.loadingGroupsAction,
      response: actions.responseGroupsAction,
      request: actions.requestGroupsAction
    }
  },
  (state: Modules.Unauthenticated.StoreObj) => state.share.account.id
);

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.handleAccountChange, action);
  }
}

const rootAccountSaga = createStandardSaga<Tables.SubAccountRow, Model.SubAccount>(
  {
    Request: ActionType.Budget.Account.SubAccounts.Request,
    Groups: { Request: ActionType.Budget.Account.Groups.Request }
  },
  tasks,
  watchForRequestAccountSaga,
  watchForAccountIdChangedSaga
);

export default function* rootSaga(): SagaIterator {
  yield spawn(rootAccountSaga);
  yield spawn(fringesRootSaga);
}
