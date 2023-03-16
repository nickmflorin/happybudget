import { SagaIterator } from "redux-saga";
import { takeLatest, spawn } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "store";

import { subAccount as actions, responseFringesAction } from "../../actions/public";
import * as selectors from "../../selectors";
import * as tasks from "../tasks";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type B = Model.Budget;
type TC = SubAccountsTableActionContext<B, M, true>;

const ActionMap = {
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
};

export const createTableSaga = (table: Table.TableInstance<R, M>) =>
  tabling.sagas.createPublicTableSaga<R, M, Tables.SubAccountTableStore, TC>({
    actions: { ...ActionMap, request: actions.requestAction },
    selectStore: (s: Application.Store, ctx: TC) => selectors.selectSubAccountsTableStore(s, ctx),
    tasks: store.tasks.subaccounts.createPublicTableTaskSet<B, M>({
      table,
      actions: ActionMap,
      selectBudgetStore: (state: Application.Store) =>
        selectors.selectBudgetStore<B, true>(state, {
          domain: "budget",
          public: true,
        }),
      selectIndexedStore: (state: Application.Store) =>
        selectors.selectBudgetStore<B, true>(state, {
          domain: "budget",
          public: true,
        }).subaccount,
    }),
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestSubAccountAction.toString()], tasks.getSubAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
