import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, cancelled, take, cancel, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling } from "lib";

import { SubAccountsTable } from "components/tabling";

import {
  ActionType,
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
        yield put(actions.responseSubAccountAction(undefined));
      }
    } finally {
      if (yield cancelled()) {
        source.cancel();
      }
    }
  }
}

function* watchForSubAccountIdChangedSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.SetId);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccount, action);
  }
}

function* watchForRequestSubAccountSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.SubAccount.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(getSubAccount, action);
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
  Redux.TableTaskMapWithGroups<Tables.SubAccountRowData, Model.SubAccount>,
  Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Model.BudgetGroup>
>({
  actions: ActionMap,
  tasks: budgeting.tasks.subaccounts.createTableTaskSet<Model.SubAccount, Model.Template>({
    columns: SubAccountsTable.AuthenticatedTemplateColumns,
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
  })
});

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForSubAccountIdChangedSaga);
  yield spawn(watchForRequestSubAccountSaga);
  yield spawn(tableSaga);
}
