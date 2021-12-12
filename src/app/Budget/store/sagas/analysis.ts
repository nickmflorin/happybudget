import { SagaIterator } from "redux-saga";
import { put, select, all } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import { notifications, redux } from "lib";

import * as actions from "../actions";

function* request(action: Redux.Action<null>): SagaIterator {
  const objId = yield select((state: Application.Authenticated.Store) => state.budget.id);
  if (!isNil(objId)) {
    yield put(actions.analysis.loadingAction(true));
    let effects = [
      api.request(api.getBudgetAccounts, objId, {}),
      api.request(api.getBudgetAccountGroups, objId, {}),
      api.request(api.getActuals, objId, {})
    ];
    try {
      const [accounts, groups, actuals]: [
        Http.ListResponse<Model.Account>,
        Http.ListResponse<Model.Group>,
        Http.ListResponse<Model.Actual>
      ] = yield all(effects);
      yield put(
        actions.analysis.responseAction({
          accounts,
          groups,
          actuals
        })
      );
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the analysis data.");
      yield put(
        actions.analysis.responseAction({
          accounts: { count: 0, data: [] },
          groups: { count: 0, data: [] },
          actuals: { count: 0, data: [] }
        })
      );
    } finally {
      yield put(actions.analysis.loadingAction(false));
    }
  }
}

const rootSaga = redux.sagas.createListResponseSaga({
  tasks: { request },
  actions: { request: actions.analysis.requestAction }
});

export default rootSaga;
