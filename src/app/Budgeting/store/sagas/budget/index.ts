import { SagaIterator } from "redux-saga";
import { spawn, takeLatest, put } from "redux-saga/effects";

import * as api from "api";
import { tabling, notifications, http } from "lib";
import * as store from "store";

import * as actions from "../../actions/budget";

import analysisSaga from "./analysis";
import accountSaga from "./account";
import subAccountSaga from "./subAccount";

export * as accounts from "./accounts";
export * as actuals from "./actuals";
export * as account from "./account";
export * as subAccount from "./subAccount";

const FringesActionMap = {
  handleEvent: actions.handleFringesTableEventAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  updateBudgetInState: actions.updateBudgetInStateAction,
  setSearch: actions.setFringesSearchAction
};

function* getBudgetTask(action: Redux.Action<number>): SagaIterator {
  yield put(actions.loadingBudgetAction(true));
  try {
    const response: Model.Budget = yield http.request(api.getBudget, action.context, action.payload);
    yield put(actions.responseBudgetAction(response));
  } catch (e: unknown) {
    const err = e as Error;
    if (err instanceof api.PermissionError && err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR) {
      notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
    } else {
      notifications.ui.banner.handleRequestError(err);
    }
    yield put(actions.responseBudgetAction(null));
  } finally {
    yield put(actions.loadingBudgetAction(false));
  }
}

export const createFringesTableSaga = (
  table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>,
  parentType: "account" | "subaccount"
) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Tables.FringeTableContext
  >({
    actions: FringesActionMap,
    selectStore: (state: Application.Store) => state.budget[parentType].table.fringes,
    tasks: store.tasks.fringes.createTableTaskSet<Model.Budget>({
      table,
      selectParentTableStore: (state: Application.Store) => state.budget[parentType].table,
      actions:
        parentType === "account"
          ? {
              ...FringesActionMap,
              requestParentTableData: actions.account.requestAction,
              requestParent: actions.account.requestAccountAction
            }
          : {
              ...FringesActionMap,
              requestParentTableData: actions.subAccount.requestAction,
              requestParent: actions.subAccount.requestSubAccountAction
            }
    })
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(analysisSaga);
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), getBudgetTask);
}
