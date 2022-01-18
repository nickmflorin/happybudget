import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel, delay, flush, fork } from "redux-saga/effects";
import { isNil, map, isEqual } from "lodash";

import { tabling, notifications } from "lib";

export const createTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
>(
  config: Table.SagaConfig<R, M, C, A>
): Saga => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    if (!isNil(config.actions.request) && !isNil(config.tasks.request)) {
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
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
>(
  config: Table.SagaConfig<R, M, C, A>
): Saga => {
  return createTableSaga<R, M, C, A>(config);
};

type Batch<
  E extends Table.ChangeEvent<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
> = {
  readonly events: E[];
  // All of the events in a batch must have the same context.
  readonly context: C;
};

export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
>(
  config: Table.SagaConfig<R, M, C, A>
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
  function* flushEvents(actions: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C>[]): SagaIterator {
    const events: Table.ChangeEvent<R, M>[] = map(
      actions,
      (a: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C>) => a.payload
    );
    const contexts: C[] = map(actions, (a: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C>) => a.context);

    function* flushDataBatch(batch: Batch<Table.DataChangeEvent<R>, R, M, C>): SagaIterator {
      if (batch.events.length !== 0) {
        const event = tabling.events.consolidateDataChangeEvents(batch.events);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event, batch.context);
        }
      }
    }

    function* flushRowAddBatch(batch: Batch<Table.RowAddDataEvent<R>, R, M, C>): SagaIterator {
      if (batch.events.length !== 0) {
        const event = tabling.events.consolidateRowAddEvents(batch.events);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event, batch.context);
        }
      }
    }

    let runningDataChangeBatch: Batch<Table.DataChangeEvent<R>, R, M, C> = {
      events: [],
      context: {} as C // Will be added when we encounter first event.
    };
    let runningRowAddBatch: Batch<Table.RowAddDataEvent<R>, R, M, C> = {
      events: [],
      context: {} as C // Will be added when we encounter first event.
    };

    const addEventToBatch = <E extends Table.DataChangeEvent<R> | Table.RowAddDataEvent<R>>(
      batch: Batch<E, R, M, C>,
      e: E,
      c: C
    ) => {
      if (batch.events.length === 0) {
        return { ...batch, events: [e], context: c };
      } else {
        if (!isEqual(c, batch.context)) {
          throw new Error(
            `Contexts for batched events of type ${e.type} are not equal! ${notifications.objToJson(
              batch.context
            )} != ${notifications.objToJson(c)}`
          );
        }
        return { ...batch, events: [...batch.events, e] };
      }
    };

    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      const c = contexts[i];
      if (tabling.typeguards.isDataChangeEvent(e)) {
        runningDataChangeBatch = addEventToBatch(runningDataChangeBatch, e, c);
        yield fork(flushRowAddBatch, runningRowAddBatch);
        runningRowAddBatch = {
          events: [],
          context: {} as C
        };
      } else if (tabling.typeguards.isRowAddEvent(e) && tabling.typeguards.isRowAddDataEvent(e)) {
        runningRowAddBatch = addEventToBatch(runningRowAddBatch, e, c);
        yield fork(flushDataBatch, runningDataChangeBatch);
        runningDataChangeBatch = {
          events: [],
          context: {} as C
        };
      } else {
        yield fork(flushDataBatch, runningDataChangeBatch);
        runningDataChangeBatch = {
          events: [],
          context: {} as C
        };
        yield fork(flushRowAddBatch, runningRowAddBatch);
        runningRowAddBatch = {
          events: [],
          context: {} as C
        };
        yield fork(config.tasks.handleChangeEvent, e, c);
      }
    }
    // Cleanup leftover events at the end.
    yield fork(flushDataBatch, runningDataChangeBatch);
    yield fork(flushRowAddBatch, runningRowAddBatch);
  }

  function* tableChangeEventSaga(): SagaIterator {
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    while (true) {
      const action: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C> = yield take(changeChannel);
      const e: Table.ChangeEvent<R, M> = action.payload;

      if (tabling.typeguards.isDataChangeEvent(e)) {
        yield delay(200);
        const actions: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C>[] = yield flush(changeChannel);
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
        const actions: Redux.ActionWithContext<Table.ChangeEvent<R, M>, C>[] = yield flush(changeChannel);
        yield call(flushEvents, [action, ...actions]);
      } else {
        yield call(config.tasks.handleChangeEvent, e, action.context);
      }
    }
  }

  const baseTableSaga = createTableSaga<R, M, C, A>(config);

  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
