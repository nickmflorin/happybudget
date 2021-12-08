import { SagaIterator } from "redux-saga";
import { call, put, select, spawn, all, takeLatest } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  subAccount as actions,
  loadingBudgetAction,
  updateBudgetInStateAction,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../actions";

function* getSubAccount(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Application.Authenticated.Store) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    try {
      const response: Model.SubAccount = yield api.request(api.getSubAccount, subaccountId);
      yield put(actions.responseSubAccountAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the sub account.");
      yield put(actions.responseSubAccountAction(null));
    }
  }
}

const ActionMap = {
  updateParentInState: actions.updateInStateAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  saving: actions.savingTableAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.SubAccount, Model.Budget>({
  columns: SubAccountsTable.Columns,
  selectStore: (state: Application.Authenticated.Store) => state.budget.subaccount.table,
  selectBudgetId: (state: Application.Authenticated.Store) => state.budget.id,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.subaccount.id,
  actions: ActionMap,
  services: {
    request: api.getSubAccountSubAccounts,
    requestGroups: api.getSubAccountSubAccountGroups,
    requestMarkups: api.getSubAccountSubAccountMarkups,
    requestFringes: api.getBudgetFringes,
    bulkCreate: api.bulkCreateSubAccountSubAccounts,
    bulkDelete: api.bulkDeleteSubAccountSubAccounts,
    bulkUpdate: api.bulkUpdateSubAccountSubAccounts,
    bulkDeleteMarkups: api.bulkDeleteSubAccountMarkups
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
  yield all([call(getSubAccount, action), call(Tasks.request, action)]);
}

export default function* rootSaga(): SagaIterator {
  yield takeLatest(actions.setSubAccountIdAction.toString(), getData);
  yield takeLatest(actions.requestAction.toString(), Tasks.request);
  yield takeLatest(actions.requestSubAccountAction.toString(), getSubAccount);
  yield spawn(tableSaga);
}
