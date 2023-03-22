import { SagaIterator } from "redux-saga";
import { takeLatest, spawn } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "application/store";

import { account as actions, responseFringesAction } from "../../actions/public";
import * as selectors from "../../selectors";
import * as tasks from "../tasks";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type B = Model.Budget;
type TC = SubAccountsTableActionContext<B, Model.Account, true>;

const ActionMap = {
  loading: actions.loadingAction,
  response: actions.responseAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
};

export const createTableSaga = (table: Table.TableInstance<R, M>) =>
  tabling.sagas.createPublicTableSaga<R, M, Tables.SubAccountTableStore, TC>({
    actions: { ...ActionMap, request: actions.requestAction },
    selectStore: (state: Application.Store, ctx: TC) =>
      selectors.selectSubAccountsTableStore(state, ctx),
    tasks: store.tasks.subaccounts.createPublicTableTaskSet<B, Model.Account>({
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
        }).account,
    }),
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestAccountAction.toString()], tasks.getAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
