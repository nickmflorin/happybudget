import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, spawn, takeLatest, all } from "redux-saga/effects";
import { isNil, filter, includes } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

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
        yield put(actions.responseAccountAction(null));
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

const ActionMap = {
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
  selectAutoIndex: (state: Application.Authenticated.Store) => state.template.autoIndex,
  selectData: (state: Application.Authenticated.Store) => state.template.account.table.data,
  actions: ActionMap,
  columns: filter(
    SubAccountsTable.Columns,
    (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>) =>
      !includes(["contact", "actual", "variance"], c.field)
  ),
  services: {
    request: api.getAccountSubAccounts,
    requestGroups: api.getAccountSubAccountGroups,
    requestFringes: api.getTemplateFringes,
    bulkCreate: api.bulkCreateAccountSubAccounts,
    bulkDelete: api.bulkDeleteAccountSubAccounts,
    bulkUpdate: api.bulkUpdateAccountSubAccounts
  }
});

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Model.BudgetGroup,
  Redux.TableTaskMap<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: Tasks
});

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getAccount, action), call(Tasks.request, action)]);
}

function* watchForAccountIdChangedSaga(): SagaIterator {
  yield takeLatest(actions.setAccountIdAction.toString(), getData);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForAccountIdChangedSaga);
  yield spawn(tableSaga);
}
