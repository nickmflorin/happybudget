import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel } from "redux-saga/effects";
import { isNil } from "lodash";

import * as typeguards from "lib/model/typeguards";
import { takeWithCancellableById } from "lib/redux/sagas";

interface CommentsActionMap {
  Request: string;
  Submit: string;
  Delete: string;
  Edit: string;
}

interface HistoryActionMap {
  Request: string;
}

interface GroupsActionMap {
  Request: string;
  Delete: string;
  RemoveModel: string;
  AddModel: string;
}

interface FringesActionMap {
  TableChanged: string;
  Request: string;
}

interface ActionMap {
  Comments?: CommentsActionMap;
  History?: HistoryActionMap;
  Groups: GroupsActionMap;
  Request: string;
  TableChange: string;
}

interface CommentsTaskMap {
  Request: Redux.Task<null>;
  Submit: Redux.Task<{ parent?: number; data: Http.CommentPayload }>;
  Delete: Redux.Task<number>;
  Edit: Redux.Task<Redux.UpdateModelActionPayload<Model.Comment>>;
}

interface HistoryTasMap {
  Request: Redux.Task<null>;
}

interface GroupsTaskMap {
  Request: Redux.Task<null>;
  Delete: Redux.Task<number>;
  RemoveModel: Redux.Task<number>;
  AddModel: Redux.Task<{ id: number; group: number }>;
}

interface FringeTaskMap {
  getFringes: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<BudgetTable.FringeRow, Model.Fringe>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<BudgetTable.FringeRow, Model.Fringe>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<BudgetTable.FringeRow, Model.Fringe>>;
}

interface TaskMap<R extends Table.Row, M extends Model.Model> {
  Comments?: CommentsTaskMap;
  History?: HistoryTasMap;
  Groups: GroupsTaskMap;
  Request: Redux.Task<null>;
  HandleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
  HandleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
  HandleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
}

const createStandardHistorySaga = (actions: HistoryActionMap, tasks: HistoryTasMap) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(actions.Request);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(tasks.Request, action);
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

const createStandardCommentsSaga = (actions: CommentsActionMap, tasks: CommentsTaskMap) => {
  function* requestSaga(): SagaIterator {
    if (!isNil(actions.Request)) {
      let lastTasks;
      while (true) {
        const action = yield take(actions.Request);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(tasks.Request, action);
      }
    }
  }

  function* submitSaga(): SagaIterator {
    if (!isNil(actions.Submit)) {
      let lastTasks;
      while (true) {
        const action = yield take(actions.Submit);
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(tasks.Submit, action);
      }
    }
  }

  function* deleteSaga(): SagaIterator {
    if (!isNil(actions.Delete)) {
      yield takeWithCancellableById<number>(actions.Delete, tasks.Delete, (p: number) => p);
    }
  }

  function* editSaga(): SagaIterator {
    if (!isNil(actions.Edit)) {
      yield takeWithCancellableById<Redux.UpdateModelActionPayload<Model.Comment>>(
        actions.Edit,
        tasks.Edit,
        (p: Redux.UpdateModelActionPayload<Model.Comment>) => p.id
      );
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(submitSaga);
    yield spawn(deleteSaga);
    yield spawn(editSaga);
  }
  return rootSaga;
};

const createStandardGroupsSaga = (actions: GroupsActionMap, tasks: GroupsTaskMap) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(actions.Request);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(tasks.Request, action);
    }
  }

  function* deleteSaga(): SagaIterator {
    yield takeWithCancellableById<number>(actions.Delete, tasks.Delete, (p: number) => p);
  }

  function* removeModelSaga(): SagaIterator {
    yield takeWithCancellableById<number>(actions.RemoveModel, tasks.RemoveModel, (p: number) => p);
  }

  function* addModelSaga(): SagaIterator {
    yield takeWithCancellableById<{ id: number; group: number }>(
      actions.AddModel,
      tasks.AddModel,
      (p: { id: number; group: number }) => p.id
    );
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(removeModelSaga);
    yield spawn(deleteSaga);
    yield spawn(addModelSaga);
  }
  return rootSaga;
};

export const createStandardFringesSaga = (actions: FringesActionMap, tasks: FringeTaskMap) => {
  function* fringesTableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(actions.TableChanged);
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;
        if (typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleDataChangeEvent,
            action as Redux.Action<Table.DataChangeEvent<BudgetTable.FringeRow, Model.Fringe>>
          );
        } else if (typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleRowAddEvent,
            action as Redux.Action<Table.RowAddEvent<BudgetTable.FringeRow, Model.Fringe>>
          );
        } else if (typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleRowDeleteEvent,
            action as Redux.Action<Table.RowDeleteEvent<BudgetTable.FringeRow, Model.Fringe>>
          );
        }
      }
    }
  }

  function* requestFringesSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(actions.Request);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(tasks.getFringes, action);
    }
  }

  function* fringesRootSaga(): SagaIterator {
    yield spawn(requestFringesSaga);
    yield spawn(fringesTableChangeEventSaga);
  }

  return fringesRootSaga;
};

export const createStandardSaga = <R extends Table.Row, M extends Model.Model>(
  actions: ActionMap,
  tasks: TaskMap<R, M>,
  ...args: (() => SagaIterator)[]
) => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    while (true) {
      const action = yield take(actions.Request);
      if (lastTasks) {
        yield cancel(lastTasks);
      }
      lastTasks = yield call(tasks.Request, action);
    }
  }

  function* tableChangeEventSaga(): SagaIterator {
    // TODO: We probably want a way to prevent duplicate events that can cause
    // backend errors from occurring.  This would include things like trying to
    // delete the same row twice.
    const changeChannel = yield actionChannel(actions.TableChange);
    while (true) {
      const action: Redux.Action<Table.ChangeEvent<R, M>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<R, M> = action.payload;
        if (typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.HandleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
        } else if (typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.HandleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
        } else if (typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.HandleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
        }
      }
    }
  }

  const groupsSaga = createStandardGroupsSaga(actions.Groups, tasks.Groups);

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
    yield spawn(groupsSaga);
    yield spawn(tableChangeEventSaga);
    for (let i = 0; i < args.length; i++) {
      yield spawn(args[i]);
    }
    if (!isNil(actions.History) && !isNil(tasks.History)) {
      const historySaga = createStandardHistorySaga(actions.History, tasks.History);
      yield spawn(historySaga);
    }
    if (!isNil(actions.Comments) && !isNil(tasks.Comments)) {
      const commentsSaga = createStandardCommentsSaga(actions.Comments, tasks.Comments);
      yield spawn(commentsSaga);
    }
  }
  return rootSaga;
};
