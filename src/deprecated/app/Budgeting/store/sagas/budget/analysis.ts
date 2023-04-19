import * as api from "api";
import { SagaIterator } from "redux-saga";
import { put, all } from "redux-saga/effects";

import { notifications, redux, http } from "lib";

import * as actions from "../../actions/budget";

function* request(
  action: Redux.Action<null, Redux.WithActionContext<{ readonly budgetId: number }>>,
): SagaIterator {
  yield put(actions.analysis.loadingAction(true, {}));
  const effects = [
    http.request(api.getBudgetChildren, action.context, action.context.budgetId, {}),
    http.request(api.getBudgetGroups, action.context, action.context.budgetId, {}),
    http.request(api.getActuals, action.context, action.context.budgetId, {}),
  ];
  try {
    const [accounts, groups, actuals]: [
      Http.ApiListResponse<Model.Account>,
      Http.ApiListResponse<Model.Group>,
      Http.ApiListResponse<Model.Actual>,
    ] = yield all(effects);
    yield put(
      actions.analysis.responseAction(
        {
          accounts,
          groups,
          actuals,
        },
        action.context,
      ),
    );
  } catch (e: unknown) {
    notifications.ui.banner.handleRequestError(e as Error);
    yield put(
      actions.analysis.responseAction(
        {
          accounts: { count: 0, data: [], query: {} },
          groups: { count: 0, data: [], query: {} },
          actuals: { count: 0, data: [], query: {} },
        },
        action.context,
      ),
    );
  } finally {
    yield put(actions.analysis.loadingAction(false, {}));
  }
}

const rootSaga = redux.createListSaga<
  number,
  Redux.WithActionContext<{ readonly budgetId: number }>
>({
  tasks: { request },
  actions: { request: actions.analysis.requestAction },
});

export default rootSaga;
