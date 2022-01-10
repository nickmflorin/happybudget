import { SagaIterator } from "redux-saga";
import { put, all } from "redux-saga/effects";

import * as api from "api";
import { notifications, redux } from "lib";

import * as actions from "../actions";

function* request(action: Redux.Action<number>): SagaIterator {
  yield put(actions.analysis.loadingAction(true));
  const effects = [
    api.request(api.getBudgetAccounts, action.payload, {}),
    api.request(api.getBudgetAccountGroups, action.payload, {}),
    api.request(api.getActuals, action.payload, {})
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
    notifications.ui.banner.handleRequestError(e as Error);
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

const rootSaga = redux.sagas.createListResponseSaga<number>({
  tasks: { request },
  actions: { request: actions.analysis.requestAction }
});

export default rootSaga;
