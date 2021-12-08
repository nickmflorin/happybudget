import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, call, put, select, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";
import { FringesTable } from "components/tabling";

import * as actions from "../actions";

import accountSaga from "./account";
import accountsSaga from "./accounts";
import actualsSaga from "./actuals";
import subAccountSaga from "./subAccount";
import pdfSaga from "./pdf";
import analysisSaga from "./analysis";

const FringesActionMap = {
  requestAccount: actions.account.requestAccountAction,
  requestSubAccount: actions.subAccount.requestSubAccountAction,
  requestAccountTableData: actions.account.requestAction,
  requestSubAccountTableData: actions.subAccount.requestAction,
  tableChanged: actions.handleFringesTableChangeEventAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  saving: actions.savingFringesTableAction,
  addModelsToState: actions.addFringeModelsToStateAction,
  loadingBudget: actions.loadingBudgetAction,
  updateBudgetInState: actions.updateBudgetInStateAction,
  setSearch: actions.setFringesSearchAction,
  responseFringeColors: actions.responseFringeColorsAction
};

const FringesTasks = budgeting.tasks.fringes.createTableTaskSet<Model.Budget>({
  columns: FringesTable.Columns,
  selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
  selectAccountTableStore: (state: Application.Authenticated.Store) => state.budget.account.table,
  selectSubAccountTableStore: (state: Application.Authenticated.Store) => state.budget.subaccount.table,
  actions: FringesActionMap,
  services: {
    request: api.getBudgetFringes,
    bulkCreate: api.bulkCreateBudgetFringes,
    bulkDelete: api.bulkDeleteBudgetFringes,
    bulkUpdate: api.bulkUpdateBudgetFringes
  }
});

const fringesTableSaga = tabling.sagas.createAuthenticatedTableSaga<Tables.FringeRowData, Model.Fringe>({
  actions: FringesActionMap,
  tasks: FringesTasks
});

function* getBudgetTask(action: Redux.Action<null>): SagaIterator {
  const budgetId = yield select((state: Application.Authenticated.Store) => state.budget.id);
  if (!isNil(budgetId)) {
    yield put(actions.loadingBudgetAction(true));
    try {
      const response: Model.Budget = yield api.request(api.getBudget, budgetId);
      yield put(actions.responseBudgetAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the budget.");
      yield put(actions.responseBudgetAction(null));
    } finally {
      yield put(actions.loadingBudgetAction(false));
    }
  }
}

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getBudgetTask, action), call(FringesTasks.request, action)]);
}

function* watchForBudgetIdChangedSaga(): SagaIterator {
  yield takeLatest(actions.setBudgetIdAction.toString(), getData);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForBudgetIdChangedSaga);
  yield spawn(fringesTableSaga);
  yield spawn(accountSaga);
  yield spawn(accountsSaga);
  yield spawn(actualsSaga);
  yield spawn(subAccountSaga);
  yield spawn(pdfSaga);
  yield spawn(analysisSaga);
}
