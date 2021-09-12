import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  ActionType,
  account as actions,
  loadingTemplateAction,
  updateTemplateInStateAction,
  responseFringesAction,
  responseFringeColorsAction,
  responseSubAccountUnitsAction
} from "../actions";

function* getAccount(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Application.Authenticated.Store) => state.budget.account.id);
  if (!isNil(accountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const response: Model.Account = yield call(api.getAccount, accountId, { cancelToken: source.token });
      yield put(actions.responseAccountAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the account.");
        yield put(actions.responseAccountAction(undefined));
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* watchForRequestAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccount, action);
  }
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Account.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getAccount, action);
  }
}

const ActionMap = {
  tableChanged: actions.handleTableChangeEventAction,
  request: actions.requestAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingTemplateAction,
  updateBudgetInState: updateTemplateInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseSubAccountUnits: responseSubAccountUnitsAction,
  responseFringeColors: responseFringeColorsAction
};

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Model.BudgetGroup,
  Redux.TableTaskMap<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.subaccounts.createTableTaskSet<Model.Account, Model.Template>({
    selectObjId: (state: Application.Authenticated.Store) => state.template.account.id,
    selectAutoIndex: (state: Application.Authenticated.Store) => state.template.autoIndex,
    actions: ActionMap,
    columns: SubAccountsTable.AuthenticatedTemplateColumns,
    services: {
      request: api.getAccountSubAccounts,
      requestGroups: api.getAccountSubAccountGroups,
      requestFringes: api.getTemplateFringes,
      bulkCreate: api.bulkCreateAccountSubAccounts,
      bulkDelete: api.bulkDeleteAccountSubAccounts,
      bulkUpdate: api.bulkUpdateAccountSubAccounts
    }
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(watchForRequestAccountSaga);
  yield spawn(tableSaga);
}
