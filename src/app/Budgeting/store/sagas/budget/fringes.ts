import { SagaIterator } from "redux-saga";
import { spawn, actionChannel, take, cancel, call } from "redux-saga/effects";
import { isNil } from "lodash";

import * as api from "api";
import * as typeguards from "lib/model/typeguards";

import { ActionType } from "../../actions";
import { requestBudgetAction } from "../../actions/budget";
import * as actions from "../../actions/budget/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Budget>(
  {
    response: actions.responseFringesAction,
    loading: actions.loadingFringesAction,
    addToState: actions.addFringeToStateAction,
    deleting: actions.deletingFringeAction,
    creating: actions.creatingFringeAction,
    updating: actions.updatingFringeAction,
    requestBudget: requestBudgetAction
  },
  {
    request: api.getBudgetFringes,
    create: api.createBudgetFringe,
    bulkUpdate: api.bulkUpdateBudgetFringes,
    bulkCreate: api.bulkCreateBudgetFringes,
    bulkDelete: api.bulkDeleteBudgetFringes
  },
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.id,
  (state: Modules.ApplicationStore) => state.budgeting.budget.fringes.data
);

function* tableChangeEventSaga(): SagaIterator {
  // TODO: We probably want a way to prevent duplicate events that can cause
  // backend errors from occurring.  This would include things like trying to
  // delete the same row twice.
  const changeChannel = yield actionChannel(ActionType.Budget.Fringes.TableChanged);
  while (true) {
    const action: Redux.Action<Table.ChangeEvent<any>> = yield take(changeChannel);
    if (!isNil(action.payload)) {
      const event: Table.ChangeEvent<any> = action.payload;
      if (typeguards.isDataChangeEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(tasks.handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<any>>);
      } else if (typeguards.isRowAddEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(tasks.handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<any>>);
      } else if (typeguards.isRowDeleteEvent(event)) {
        // Blocking call so that table changes happen sequentially.
        yield call(tasks.handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent>);
      }
    }
  }
}

function* requestSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Budget.Fringes.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getFringes, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(requestSaga);
  yield spawn(tableChangeEventSaga);
}
