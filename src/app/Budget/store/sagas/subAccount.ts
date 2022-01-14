import { SagaIterator } from "redux-saga";
import { put, takeLatest, spawn } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { budgeting, tabling, notifications } from "lib";

import {
  subAccount as actions,
  loadingBudgetAction,
  updateBudgetInStateAction,
  responseFringeColorsAction,
  responseFringesAction,
  responseSubAccountUnitsAction
} from "../actions";

function* getSubAccount(action: Redux.Action<number>): SagaIterator {
  try {
    const response: Model.SubAccount = yield api.request(api.getSubAccount, action.payload);
    yield put(actions.responseSubAccountAction(response));
  } catch (e: unknown) {
    const err = e as Error;
    if (
      err instanceof api.ClientError &&
      !isNil(err.permissionError) &&
      err.permissionError.code === "subscription_permission_error"
    ) {
      notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
    } else {
      notifications.ui.banner.handleRequestError(e as Error);
    }
    yield put(actions.responseSubAccountAction(null));
  }
}

const ActionMap = {
  updateParentInState: actions.updateInStateAction,
  tableChanged: actions.handleTableChangeEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  addModelsToState: actions.addModelsToStateAction,
  loadingBudget: loadingBudgetAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
  responseFringeColors: responseFringeColorsAction,
  responseSubAccountUnits: responseSubAccountUnitsAction
};

export const createTableSaga = (table: Table.TableInstance<Tables.SubAccountRowData, Model.SubAccount>) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.SubAccountRowData,
    Model.SubAccount,
    Tables.SubAccountTableContext,
    Redux.AuthenticatedTableActionMap<Tables.SubAccountRowData, Model.SubAccount, Tables.SubAccountTableContext>
  >({
    actions: { ...ActionMap, request: actions.requestAction },
    tasks: budgeting.tasks.subaccounts.createTableTaskSet<Model.SubAccount, Model.Budget>({
      table,
      selectStore: (state: Application.AuthenticatedStore) => state.budget.subaccount.table,
      actions: ActionMap,
      services: {
        create: api.createSubAccountSubAccount,
        request: api.getSubAccountSubAccounts,
        requestGroups: api.getSubAccountSubAccountGroups,
        requestMarkups: api.getSubAccountSubAccountMarkups,
        requestFringes: api.getBudgetFringes,
        bulkCreate: api.bulkCreateSubAccountSubAccounts,
        bulkDelete: api.bulkDeleteSubAccountSubAccounts,
        bulkUpdate: api.bulkUpdateSubAccountSubAccounts,
        bulkDeleteMarkups: api.bulkDeleteSubAccountMarkups
      }
    })
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestSubAccountAction.toString()], getSubAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
