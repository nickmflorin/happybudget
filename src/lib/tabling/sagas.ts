import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel, delay, flush, fork } from "redux-saga/effects";
import { isNil, map } from "lodash";

import { tabling } from "lib";

/* eslint-disable indent */
export const createTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  A extends Redux.TableActionMap<M> & { readonly request?: any } = Redux.TableActionMap<M> & {
    readonly request?: any;
  }
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    if (!isNil(config.actions.request)) {
      while (true) {
        const action = yield take(config.actions.request.toString());
        if (lastTasks) {
          yield cancel(lastTasks);
        }
        lastTasks = yield call(config.tasks.request, action);
      }
    }
  }

  function* rootSaga(): SagaIterator {
    yield spawn(requestSaga);
  }
  return rootSaga;
};

export const createUnauthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  A extends Redux.TableActionMap<M> & { readonly request?: any } = Redux.TableActionMap<M> & {
    readonly request?: any;
  }
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  return createTableSaga<R, M, A>(config);
};

/* eslint-disable indent */
export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  A extends Redux.AuthenticatedTableActionMap<R, M> & { readonly request?: any } = Redux.AuthenticatedTableActionMap<
    R,
    M
  > & { readonly request?: any }
>(
  config: Table.SagaConfig<R, M, A>
): Saga => {
  /**
   * Flushes events that are queued in the Action Channel by batching like,
   * consecutive events together to perform bulk API updates instead of individual
   * ones.
   *
   * The algorithm is written specifically to only batch together consecutive
   * events, such that the original order the events occurred in is preserved
   * (which is important).
   *
   * Events: [A, A, A, B, A, A, B, B, C, B, C, A, A, B]
   * In Batches: [[A, A, A], [B], [A, A], [B, B], [C], [B], [C], [A, A], B]
   */
  function* flushEvents(actions: Redux.Action<Table.ChangeEvent<R, M>>[]): SagaIterator {
    const events: Table.ChangeEvent<R, M>[] = map(actions, (a: Redux.Action<Table.ChangeEvent<R, M>>) => a.payload);

    function* flushDataBatch(batch: Table.DataChangeEvent<R>[]): SagaIterator {
      if (batch.length !== 0) {
        const event = tabling.events.consolidateDataChangeEvents(batch);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event);
        }
      }
    }

    function* flushRowAddBatch(batch: Table.RowAddDataEvent<R>[]): SagaIterator {
      if (batch.length !== 0) {
        const event = tabling.events.consolidateRowAddEvents(batch);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event);
        }
      }
    }

    let runningDataChangeBatch: Table.DataChangeEvent<R>[] = [];
    let runningRowAddBatch: Table.RowAddDataEvent<R>[] = [];

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (tabling.typeguards.isDataChangeEvent(e)) {
        runningDataChangeBatch = [...runningDataChangeBatch, e];
        yield fork(flushRowAddBatch, runningRowAddBatch);
        runningRowAddBatch = [];
      } else if (tabling.typeguards.isRowAddEvent(e) && tabling.typeguards.isRowAddDataEvent(e)) {
        runningRowAddBatch = [...runningRowAddBatch, e];
        yield fork(flushDataBatch, runningDataChangeBatch);
        runningDataChangeBatch = [];
      } else {
        yield fork(flushDataBatch, runningDataChangeBatch);
        runningDataChangeBatch = [];
        yield fork(flushRowAddBatch, runningRowAddBatch);
        runningRowAddBatch = [];
        yield fork(config.tasks.handleChangeEvent, e);
      }
    }
    // Cleanup leftover events at the end.
    yield fork(flushDataBatch, runningDataChangeBatch);
    yield fork(flushRowAddBatch, runningRowAddBatch);
  }

  function* tableChangeEventSaga(): SagaIterator {
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    while (true) {
      const action = yield take(changeChannel);
      const e: Table.ChangeEvent<R, M> = action.payload;

      if (tabling.typeguards.isDataChangeEvent(e)) {
        yield delay(200);
        const actions: Redux.Action<Table.ChangeEvent<R, M>>[] = yield flush(changeChannel);
        yield call(flushEvents, [action, ...actions]);
      } else if (
        /* We do not want to buffer RowAdd events if the row is being added either
           by the RowAddIndexPayload or the RowAddCountPayload. */
        tabling.typeguards.isRowAddEvent(e) &&
        tabling.typeguards.isRowAddDataEvent(e)
      ) {
        /* Buffer and flush data change events and new row events that occur
					 every 500ms - this is particularly important for dragging cell values
					 to update other cell values as it submits a separate DataChangeEvent
					 for every new cell value. */
        yield delay(500);
        const actions: Redux.Action<Table.ChangeEvent<R, M>>[] = yield flush(changeChannel);
        yield call(flushEvents, [action, ...actions]);
      } else {
        yield call(config.tasks.handleChangeEvent, e);
      }
    }
  }

  const baseTableSaga = createTableSaga<R, M, A>(config);

  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
