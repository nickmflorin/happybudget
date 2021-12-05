import { SagaIterator } from "redux-saga";
import { spawn, call, put, select, takeLatest, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";
import { FringesTable } from "components/tabling";

import * as actions from "../actions";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import subAccountSaga from "./subAccount";

const FringesActionMap = {
  requestAccount: actions.account.requestAccountAction,
  requestSubAccount: actions.subAccount.requestSubAccountAction,
  requestAccountTableData: actions.account.requestAction,
  requestSubAccountTableData: actions.subAccount.requestAction,
  tableChanged: actions.handleFringesTableChangeEventAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  saving: actions.savingFringesTableAction,
  clear: actions.clearFringesAction,
  addModelsToState: actions.addFringeModelsToStateAction,
  loadingBudget: actions.loadingTemplateAction,
  updateBudgetInState: actions.updateTemplateInStateAction,
  setSearch: actions.setFringesSearchAction,
  responseFringeColors: actions.responseFringeColorsAction
};

const FringesTasks = budgeting.tasks.fringes.createTableTaskSet<Model.Template>({
  columns: FringesTable.Columns,
  selectObjId: (state: Application.Authenticated.Store) => state.template.id,
  selectAccountTableStore: (state: Application.Authenticated.Store) => state.template.account.table,
  selectSubAccountTableStore: (state: Application.Authenticated.Store) => state.template.subaccount.table,
  actions: FringesActionMap,
  services: {
    request: api.getTemplateFringes,
    bulkCreate: api.bulkCreateTemplateFringes,
    bulkDelete: api.bulkDeleteTemplateFringes,
    bulkUpdate: api.bulkUpdateTemplateFringes
  }
});

const fringesTableSaga = tabling.sagas.createAuthenticatedTableSaga<Tables.FringeRowData, Model.Fringe>({
  actions: FringesActionMap,
  tasks: FringesTasks
});

export function* getTemplateTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Application.Authenticated.Store) => state.template.id);
  if (!isNil(templateId)) {
    yield put(actions.loadingTemplateAction(true));
    try {
      const response: Model.Template = yield api.request(api.getTemplate, templateId);
      yield put(actions.responseTemplateAction(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the template.");
      yield put(actions.responseTemplateAction(null));
    } finally {
      yield put(actions.loadingTemplateAction(false));
    }
  }
}

function* getData(action: Redux.Action<any>): SagaIterator {
  yield all([call(getTemplateTask, action), call(FringesTasks.request, action)]);
}

function* watchForTemplateIdChangedSaga(): SagaIterator {
  yield takeLatest(actions.setTemplateIdAction.toString(), getData);
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForTemplateIdChangedSaga);
  yield spawn(fringesTableSaga);
  yield spawn(accountSaga);
  yield spawn(budgetSaga);
  yield spawn(subAccountSaga);
}
