import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, spawn, all, takeLatest } from "redux-saga/effects";
import { isNil, filter, includes } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  subAccount as actions,
  loadingTemplateAction,
  updateTemplateInStateAction,
  responseFringesAction,
  responseFringeColorsAction,
  responseSubAccountUnitsAction
} from "../actions";

function* getSubAccount(action: Redux.Action<null>): SagaIterator {
  const subaccountId = yield select((state: Application.Authenticated.Store) => state.budget.subaccount.id);
  if (!isNil(subaccountId)) {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    try {
      const response: Model.SubAccount = yield call(api.getSubAccount, subaccountId, { cancelToken: source.token });
      yield put(actions.responseSubAccountAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the sub account.");
        yield put(actions.responseSubAccountAction(null));
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
  clear: actions.clearAction,
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

const Tasks = budgeting.tasks.subaccounts.createTableTaskSet<Model.SubAccount, Model.Template>({
  columns: filter(
    SubAccountsTable.Columns,
    (c: Table.Column<Tables.SubAccountRowData, Model.SubAccount>) =>
      !includes(["contact", "actual", "variance"], c.field)
  ),
  selectBudgetId: (state: Application.Authenticated.Store) => state.template.id,
  selectObjId: (state: Application.Authenticated.Store) => state.template.subaccount.id,
  selectAutoIndex: (state: Application.Authenticated.Store) => state.template.autoIndex,
  actions: ActionMap,
  services: {
    request: api.getSubAccountSubAccounts,
    requestGroups: api.getSubAccountSubAccountGroups,
    requestFringes: api.getTemplateFringes,
    bulkCreate: api.bulkCreateSubAccountSubAccounts,
    bulkDelete: api.bulkDeleteSubAccountSubAccounts,
    bulkUpdate: api.bulkUpdateSubAccountSubAccounts
  }
});

const tableSaga = tabling.sagas.createAuthenticatedTableSaga<
  Tables.SubAccountRowData,
  Model.SubAccount,
  Model.BudgetGroup,
  Redux.TableTaskMapWithGroups<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: Tasks
});

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getSubAccount, action), call(Tasks.request, action)]);
}

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  yield takeLatest(actions.setSubAccountIdAction.toString(), getData);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(tableSaga);
}