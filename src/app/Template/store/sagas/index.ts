import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, put } from "redux-saga/effects";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import * as actions from "../actions";

import accountSaga from "./account";
import subAccountSaga from "./subAccount";

export * as accounts from "./accounts";
export * as account from "./account";
export * as subAccount from "./subAccount";

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

function* getBudgetTask(action: Redux.Action<number>): SagaIterator {
  yield put(actions.loadingBudgetAction(true));
  try {
    const response: Model.Template = yield api.request(api.getTemplate, action.payload);
    yield put(actions.responseBudgetAction(response));
  } catch (e: unknown) {
    notifications.ui.handleBannerRequestError(e as Error);
    yield put(actions.responseBudgetAction(null));
  } finally {
    yield put(actions.loadingBudgetAction(false));
  }
}

export const createFringesTableSaga = (table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>) =>
  tabling.sagas.createAuthenticatedTableSaga<Tables.FringeRowData, Model.Fringe, Tables.FringeTableContext>({
    actions: { ...FringesActionMap, request: actions.requestFringesAction },
    tasks: budgeting.tasks.fringes.createTableTaskSet<Model.Template>({
      table,
      selectAccountTableStore: (state: Application.AuthenticatedStore) => state.template.account.table,
      selectSubAccountTableStore: (state: Application.AuthenticatedStore) => state.template.subaccount.table,
      actions: FringesActionMap,
      services: {
        create: api.createTemplateFringe,
        request: api.getTemplateFringes,
        bulkCreate: api.bulkCreateTemplateFringes,
        bulkDelete: api.bulkDeleteTemplateFringes,
        bulkUpdate: api.bulkUpdateTemplateFringes
      }
    })
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), getBudgetTask);
}
