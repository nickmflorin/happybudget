import { SagaIterator } from "redux-saga";
import { takeLatest, spawn } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "store";

import {
  account as actions,
  responseFringesAction,
  updateBudgetInStateAction,
} from "../../actions/template";
import * as initialState from "../../initialState";
import * as selectors from "../../selectors";
import * as tasks from "../tasks";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type B = Model.Template;
type TC = SubAccountsTableActionContext<B, Model.Account, false>;

const ActionMap = {
  updateParentInState: actions.updateInStateAction,
  handleEvent: actions.handleTableEventAction,
  loading: actions.loadingAction,
  response: actions.responseAction,
  updateBudgetInState: updateBudgetInStateAction,
  setSearch: actions.setSearchAction,
  responseFringes: responseFringesAction,
};

export const createTableSaga = (table: Table.TableInstance<R, M>) =>
  tabling.sagas.createAuthenticatedTableSaga<R, M, Tables.SubAccountTableStore, TC>({
    actions: { ...ActionMap, request: actions.requestAction },
    selectStore: (state: Application.Store, ctx: TC) =>
      selectors.selectSubAccountsTableStore(state, ctx),
    tasks: store.tasks.subaccounts.createAuthenticatedTableTaskSet<B, Model.Account>({
      table,
      initialState: initialState.initialAccountState,
      selectBudgetStore: (state: Application.Store) =>
        selectors.selectBudgetStore<Model.Template, false>(state, {
          domain: "template",
          public: false,
        }),
      selectIndexedStore: (state: Application.Store) =>
        selectors.selectBudgetStore<Model.Template, false>(state, {
          domain: "template",
          public: false,
        }).account,
      actions: ActionMap,
    }),
  });

function* watchForRequestAction(): SagaIterator {
  yield takeLatest([actions.requestAccountAction.toString()], tasks.getAccount);
}

function* rootSaga(): SagaIterator {
  yield spawn(watchForRequestAction);
}

export default rootSaga;
