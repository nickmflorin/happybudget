import { SagaIterator } from "redux-saga";
import { call, put, select, spawn, takeLatest, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  account as actions,
  responseFringesAction,
  loadingBudgetAction,
  updateBudgetInStateAction,
  responseSubAccountUnitsAction,
  responseFringeColorsAction
} from "../actions";

function* getAccount(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Application.Authenticated.Store) => state.budget.account.id);
  if (!isNil(accountId)) {
    try {
      const response: Model.Account = yield api.request(api.getAccount, accountId);
      yield put(actions.responseAccountAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, { message: "There was an error retrieving the account." });
      yield put(actions.responseAccountAction(null));
    }
  }
}

const ActionMap = {
  request: actions.requestAction,
  updateParentInState: actions.updateInStateAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  clear: actions.clearAction,
  addModelsToState: actions.addModelsToStateAction,
  updateModelsInState: actions.updateModelsInStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.Account, Model.Budget>({
  columns: SubAccountsTable.Columns,
  selectBudgetId: (state: Application.Authenticated.Store) => state.budget.id,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.account.id,
  actions: ActionMap,
  services: {
    request: api.getAccountSubAccounts,
    requestGroups: api.getAccountSubAccountGroups,
    requestMarkups: api.getAccountSubAccountMarkups,
    requestFringes: api.getBudgetFringes,
    bulkCreate: api.bulkCreateAccountSubAccounts,
    bulkDelete: api.bulkDeleteAccountSubAccounts,
    bulkUpdate: api.bulkUpdateAccountSubAccounts,
    bulkDeleteMarkups: api.bulkDeleteAccountMarkups
  }
});

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount>
>({
  actions: ActionMap,
  tasks: Tasks
});

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getAccount, action), call(Tasks.request, action)]);
}

export default function* rootSaga(): SagaIterator {
  yield takeLatest(actions.setAccountIdAction.toString(), getData);
  yield takeLatest(actions.requestAction.toString(), Tasks.request);
  yield takeLatest(actions.requestAccountAction.toString(), getAccount);
  yield spawn(tableSaga);
}
