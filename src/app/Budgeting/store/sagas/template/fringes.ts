import { SagaIterator } from "redux-saga";
import { spawn, actionChannel, take, cancel, call } from "redux-saga/effects";
import { isNil, find } from "lodash";

import * as api from "api";
import * as typeguards from "lib/model/typeguards";
import { warnInconsistentState } from "lib/redux/util";

import { ActionType } from "../../actions";
import * as actions from "../../actions/template/fringes";
import { createFringeTaskSet } from "../factories";

const tasks = createFringeTaskSet<Model.Template>(
  {
    response: actions.responseFringesAction,
    loading: actions.loadingFringesAction,
    deleting: actions.deletingFringeAction,
    creating: actions.creatingFringeAction,
    updating: actions.updatingFringeAction,
    addToState: actions.addFringeToStateAction
  },
  {
    request: api.getTemplateFringes,
    create: api.createTemplateFringe,
    bulkUpdate: api.bulkUpdateTemplateFringes,
    bulkCreate: api.bulkCreateTemplateFringes,
    bulkDelete: api.bulkDeleteTemplateFringes
  },
  (state: Modules.ApplicationStore) => state.budgeting.template.template.id,
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.data,
  (id: number, action: Redux.Action<any>) => (state: Modules.ApplicationStore) => {
    const model: Model.Fringe | undefined = find(state.budgeting.template.fringes.data, { id });
    if (isNil(model)) {
      warnInconsistentState({
        action: action.type,
        reason: "Fringe does not exist in state when it is expected to.",
        id
      });
      return null;
    } else {
      return model;
    }
  }
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
