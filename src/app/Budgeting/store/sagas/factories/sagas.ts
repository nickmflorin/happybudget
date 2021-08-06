import { SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel } from "redux-saga/effects";
import { isNil } from "lodash";

import { tabling, redux } from "lib";

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
}

interface FringeTaskMap {
  getFringes: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<Tables.FringeRow, Model.Fringe>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<Tables.FringeRow, Model.Fringe>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<Tables.FringeRow, Model.Fringe>>;
}

interface TaskMap<R extends Table.Row, M extends Model.Model> {
  Comments?: CommentsTaskMap;
  History?: HistoryTasMap;
  Groups: GroupsTaskMap;
  Request: Redux.Task<null>;
  handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
  handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
  handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
  handleAddRowToGroupEvent: Redux.Task<Table.RowAddToGroupEvent<R, M>>;
  handleRemoveRowFromGroupEvent: Redux.Task<Table.RowRemoveFromGroupEvent<R, M>>;
  handleDeleteGroupEvent: Redux.Task<Table.GroupDeleteEvent>;
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
      yield redux.sagas.takeWithCancellableById<number>(actions.Delete, tasks.Delete, (p: number) => p);
    }
  }

  function* editSaga(): SagaIterator {
    if (!isNil(actions.Edit)) {
      yield redux.sagas.takeWithCancellableById<Redux.UpdateModelActionPayload<Model.Comment>>(
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

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
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
      const action: Redux.Action<Table.ChangeEvent<Tables.FringeRow, Model.Fringe>> = yield take(changeChannel);
      if (!isNil(action.payload)) {
        const event: Table.ChangeEvent<Tables.FringeRow, Model.Fringe> = action.payload;
        if (tabling.typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleDataChangeEvent,
            action as Redux.Action<Table.DataChangeEvent<Tables.FringeRow, Model.Fringe>>
          );
        } else if (tabling.typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleRowAddEvent,
            action as Redux.Action<Table.RowAddEvent<Tables.FringeRow, Model.Fringe>>
          );
        } else if (tabling.typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(
            tasks.handleRowDeleteEvent,
            action as Redux.Action<Table.RowDeleteEvent<Tables.FringeRow, Model.Fringe>>
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
        if (tabling.typeguards.isDataChangeEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleDataChangeEvent, action as Redux.Action<Table.DataChangeEvent<R, M>>);
        } else if (tabling.typeguards.isRowAddEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowAddEvent, action as Redux.Action<Table.RowAddEvent<R, M>>);
        } else if (tabling.typeguards.isRowDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRowDeleteEvent, action as Redux.Action<Table.RowDeleteEvent<R, M>>);
        } else if (tabling.typeguards.isRowAddToGroupEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleAddRowToGroupEvent, action as Redux.Action<Table.RowAddToGroupEvent<R, M>>);
        } else if (tabling.typeguards.isRowRemoveFromGroupEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleRemoveRowFromGroupEvent, action as Redux.Action<Table.RowRemoveFromGroupEvent<R, M>>);
        } else if (tabling.typeguards.isGroupDeleteEvent(event)) {
          // Blocking call so that table changes happen sequentially.
          yield call(tasks.handleDeleteGroupEvent, action as Redux.Action<Table.GroupDeleteEvent>);
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
