import { SagaIterator } from "redux-saga";
import { call, put, select, spawn, takeLatest, all } from "redux-saga/effects";
import { isNil, filter, intersection } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  account as actions,
  loadingTemplateAction,
  updateTemplateInStateAction,
  responseFringesAction,
  responseFringeColorsAction,
  responseSubAccountUnitsAction
} from "../actions";

function* getAccount(action: Redux.Action<null>): SagaIterator {
  const accountId = yield select((state: Application.Authenticated.Store) => state.template.account.id);
  if (!isNil(accountId)) {
    try {
      const response: Model.Account = yield api.request(api.getAccount, accountId);
      yield put(actions.responseAccountAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the account.");
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
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingTemplateAction,
  updateBudgetInState: updateTemplateInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseSubAccountUnits: responseSubAccountUnitsAction,
  responseFringeColors: responseFringeColorsAction,
  clear: actions.clearAction
};

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.Account, Model.Template>({
  selectObjId: (state: Application.Authenticated.Store) => state.template.account.id,
  selectBudgetId: (state: Application.Authenticated.Store) => state.template.id,
  selectStore: (state: Application.Authenticated.Store) => state.template.account.table,
  actions: ActionMap,
  columns: filter(
    SubAccountsTable.Columns as Table.Column<Tables.SubAccountRowData, Model.SubAccount>[],
    (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
      intersection([c.field, c.colId], ["variance", "contact", "actual"]).length === 0
  ),
  services: {
    request: api.getAccountSubAccounts,
    requestGroups: api.getAccountSubAccountGroups,
    requestFringes: api.getTemplateFringes,
    requestMarkups: api.getAccountSubAccountMarkups,
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
  yield takeLatest(actions.requestAccountAction.toString(), getAccount);
  yield takeLatest(actions.setAccountIdAction.toString(), getData);
  yield takeLatest(actions.requestAction.toString(), Tasks.request);
  yield spawn(tableSaga);
}
