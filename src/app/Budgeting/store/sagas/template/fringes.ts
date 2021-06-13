import { SagaIterator } from "redux-saga";
import { spawn, takeEvery, take, cancel, call } from "redux-saga/effects";

import * as api from "api";
import { takeWithCancellableById } from "lib/redux/sagas";
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
    removeFromState: actions.removeFringeFromStateAction,
    addToState: actions.addFringeToStateAction,
    updateInState: actions.updateFringeInStateAction
  },
  {
    request: api.getTemplateFringes,
    create: api.createTemplateFringe,
    bulkUpdate: api.bulkUpdateTemplateFringes,
    bulkCreate: api.bulkCreateTemplateFringes
  },
  (state: Redux.ApplicationStore) => state.budgeting.template.template.id,
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.data
);

function* watchForRemoveFringeSaga(): SagaIterator {
  yield takeWithCancellableById<number>(ActionType.Template.Fringes.Delete, tasks.handleRemoval, (p: number) => p);
}

function* watchForTableChangeSaga(): SagaIterator {
  yield takeEvery(ActionType.Template.Fringes.TableChanged, tasks.handleTableChange);
}

function* watchForRequestFringesSaga(): SagaIterator {
  let lastTasks;
  while (true) {
    const action = yield take(ActionType.Template.Fringes.Request);
    if (lastTasks) {
      yield cancel(lastTasks);
    }
    lastTasks = yield call(tasks.getFringes, action);
  }
}

export default function* rootSaga(): SagaIterator {
  yield spawn(watchForRemoveFringeSaga);
  yield spawn(watchForTableChangeSaga);
  yield spawn(watchForRequestFringesSaga);
}
