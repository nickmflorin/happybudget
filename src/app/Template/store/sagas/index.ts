import { SagaIterator } from "redux-saga";
import { spawn, call, put, select, takeLatest, cancelled, all } from "redux-saga/effects";
import axios from "axios";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";
import { FringesTable } from "components/tabling";

import * as actions from "../actions";

import accountSaga from "./account";
import budgetSaga from "./accounts";
import subAccountSaga from "./subAccount";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

const FringesActionMap = {
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
  selectObjId: (state: Application.Authenticated.Store) => state.budget.id,
  actions: FringesActionMap,
  services: {
    request: api.getTemplateFringes,
    bulkCreate: api.bulkCreateTemplateFringes,
    bulkDelete: api.bulkDeleteTemplateFringes,
    bulkUpdate: api.bulkUpdateTemplateFringes
  }
});

const fringesTableSaga = tabling.sagas.createAuthenticatedTableSaga<Tables.FringeRowData, Model.Fringe, Model.Group>({
  actions: FringesActionMap,
  tasks: FringesTasks
});

export function* getTemplateTask(action: Redux.Action<null>): SagaIterator {
  const templateId = yield select((state: Application.Authenticated.Store) => state.template.id);
  if (!isNil(templateId)) {
    yield put(actions.loadingTemplateAction(true));
    try {
      const response: Model.Template = yield call(api.getTemplate, templateId, { cancelToken: source.token });
      yield put(actions.responseTemplateAction(response));
    } catch (e: unknown) {
      if (!(yield cancelled())) {
        api.handleRequestError(e as Error, "There was an error retrieving the template.");
        yield put(actions.responseTemplateAction(null));
      }
    } finally {
      yield put(actions.loadingTemplateAction(false));
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* getData(action: Redux.Action<any>): SagaIterator {
  // yield put(actions.wipeStateAction(null));
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
