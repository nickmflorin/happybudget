import { isEqual } from "lodash";
import { Saga, SagaIterator } from "redux-saga";
import {
  spawn,
  take,
  call,
  cancel,
  actionChannel,
  delay,
  flush,
  fork,
  select,
} from "redux-saga/effects";

import { tabling, model } from "lib";

import * as types from "../../../application/store/types";

export const createPublicTableSaga = <
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends types.TableStore<R> = types.TableStore<R>,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.PublicTableSagaConfig<R, M, S, C>,
): Saga => {
  function* requestSaga(): SagaIterator {
    let lastTasks;
    if (config.actions.request !== undefined && config.tasks.request !== undefined) {
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
    /* Even though this is also checked inside of the requestSaga, we do not want to spawn an
       additional task if it is not used - so we perform the check here as well. */
    if (config.actions.request !== undefined && config.tasks.request !== undefined) {
      yield spawn(requestSaga);
    }
  }
  return rootSaga;
};

type EmptyBatch = {
  readonly events: [];
  readonly context: null;
};

type BatchChangeEventId = "dataChange" | "rowAddData";
type BatchChangeEvent<R extends tabling.Row> = tabling.ChangeEvent<BatchChangeEventId, R>;

type PopulatedBatch<
  E extends BatchChangeEvent<R>,
  R extends tabling.Row,
  C extends types.ActionContext = types.ActionContext,
> = {
  readonly events: E[];
  readonly context: C;
};

type Batch<
  E extends BatchChangeEvent<R>,
  R extends tabling.Row,
  C extends types.ActionContext = types.ActionContext,
> = PopulatedBatch<E, R, C> | EmptyBatch;

type RunningBatches<R extends tabling.Row, C extends types.ActionContext = types.ActionContext> = {
  [Key in BatchChangeEventId]: Batch<tabling.ChangeEvent<Key, R>, R, C>;
};

const batchIsEmpty = <
  E extends BatchChangeEvent<R>,
  R extends tabling.Row,
  C extends types.ActionContext = types.ActionContext,
>(
  batch: Batch<E, R, C>,
): batch is EmptyBatch => (batch as EmptyBatch).events.length === 0;

/**
 * When we are queueing actions together for the same types of events that happen at high frequency,
 * we cannot batch together events for actions that have differing values for `context`.  This is
 * because when we batch together the events for those actions, the events themselves will be merged
 * together and submitted as a whole, with the `context` property of the action narrowed down to a
 * single value.  If those contexts are the same for all actions in the batch, then we don't have a
 * problem.  But if they differ, then we have to treat entities of the batch differently.
 */
const actionInconsistentWithBatch = <
  R extends tabling.Row,
  C extends types.ActionContext = types.ActionContext,
>(
  action: types.Action<tabling.ChangeEvent<BatchChangeEventId, R>, C>,
  batch: Batch<BatchChangeEvent<R>, R, C>,
): boolean => !batchIsEmpty(batch) && !isEqual(action.context, batch.context);

interface Flusher<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends types.TableStore<R> = types.TableStore<R>,
  C extends types.ActionContext = types.ActionContext,
> {
  (
    config: types.AuthenticatedTableSagaConfig<R, M, S, C>,
    actions: types.Action<tabling.AnyChangeEvent<R>, C>[],
  ): SagaIterator;
}

/**
 * Flushes events that are queued in the Action Channel by batching like, consecutive events
 * together to perform bulk API updates instead of individual ones.
 *
 * The algorithm is written specifically to only batch together consecutive events, such that the
 * original order the events occurred in is preserved (which is important).
 *
 * Events: [A, A, A, B, A, A, B, B, C, B, C, A, A, B]
 * In Batches: [[A, A, A], [B], [A, A], [B, B], [C], [B], [C], [A, A], B]
 */
function* flushEvents<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends types.TableStore<R> = types.TableStore<R>,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.AuthenticatedTableSagaConfig<R, M, S, C>,
  actions: types.Action<tabling.AnyChangeEvent<R>, C>[],
): SagaIterator {
  let running: RunningBatches<R, C> = {
    dataChange: { context: null, events: [] },
    rowAddData: { context: null, events: [] },
  };

  const addEventToBatch = (
    action: types.Action<BatchChangeEvent<R>, C>,
    runningBatches: RunningBatches<R, C>,
  ): RunningBatches<R, C> => {
    const b: Batch<BatchChangeEvent<R>, R, C> = runningBatches[action.payload.type];

    // This should be prevented before calling this method.
    if (actionInconsistentWithBatch<R, C>(action, b)) {
      throw new Error("Action is inconsistent with batch!");
    } else if (batchIsEmpty(b)) {
      return {
        ...runningBatches,
        [action.payload.type]: { ...b, events: [action.payload], context: action.context },
      };
    } else {
      /* Because of the first check, it is guaranteed that the batch in question has a context that
         is consistent with the provided action. */
      return {
        ...runningBatches,
        [action.payload.type]: { ...b, events: [...b.events, action.payload] },
      };
    }
  };

  const clearBatch = <E extends BatchChangeEventId>(
    type: E,
    runningBatches: RunningBatches<R, C>,
  ): RunningBatches<R, C> => ({ ...runningBatches, [type]: { context: null, events: [] } });

  function* flushDataBatch(runningBatches: RunningBatches<R, C>): SagaIterator {
    const b: Batch<tabling.ChangeEvent<"dataChange", R>, R, C> = runningBatches.dataChange;
    if (!batchIsEmpty(b)) {
      const event = tabling.consolidateDataChangeEvents(b.events);
      if (!Array.isArray(event.payload) || event.payload.length !== 0) {
        yield fork(config.tasks.handleChangeEvent, event, b.context);
      }
      return clearBatch("dataChange", runningBatches);
    }
    return runningBatches;
  }

  function* flushRowAddBatch(runningBatches: RunningBatches<R, C>): SagaIterator {
    const b: Batch<tabling.ChangeEvent<"rowAddData", R>, R, C> = runningBatches.rowAddData;
    if (!batchIsEmpty(b)) {
      const event = tabling.consolidateRowAddEvents(
        (b as PopulatedBatch<tabling.ChangeEvent<"rowAddData", R>, R, C>).events,
      );
      if (!Array.isArray(event.payload) || event.payload.length !== 0) {
        yield fork(config.tasks.handleChangeEvent, event, b.context);
      }
      return clearBatch("rowAddData", runningBatches);
    }
    return runningBatches;
  }

  for (let i = 0; i < actions.length; i++) {
    const a = actions[i];
    if (types.isTableActionWithEventType(a, "dataChange")) {
      /* If the context of the new event is inconsistent with the batched events of the same type,
         that means the context changed quickly before the batch had a chance to flush. In this
         case, we need to flush the previous batch and start a new batch. */
      if (actionInconsistentWithBatch<R, C>(a, running.dataChange)) {
        running = yield call(flushDataBatch, running);
      }
      running = addEventToBatch(a, running);
    } else if (types.isTableActionWithEventType(a, "rowAddData")) {
      /* If the context of the new event is inconsistent with the batched events of the same type,
         that means the context changed quickly before the batch had a chance to flush.  In this
         case, we need to flush the previous batch and start a new batch. */
      if (actionInconsistentWithBatch(a, running.rowAddData)) {
        running = yield call(flushRowAddBatch, running);
      }
      running = addEventToBatch(a, running);
    } else {
      /* If the event was anything other than a row add event or a data change event, we need to
         flush the batches for both the queued row add and data change events and then handle the
         new event without queueing it. */
      running = yield call(flushRowAddBatch, running);
      running = yield call(flushDataBatch, running);
      yield fork(config.tasks.handleChangeEvent, a.payload, a.context);
    }
  }
  // Cleanup leftover events at the end.
  running = yield call(flushDataBatch, running);
  running = yield call(flushRowAddBatch, running);
}

export const createAuthenticatedTableSaga = <
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends types.TableStore<R> = types.TableStore<R>,
  C extends types.ActionContext = types.ActionContext,
>(
  config: types.AuthenticatedTableSagaConfig<R, M, S, C>,
): Saga => {
  const flusher: Flusher<R, M, S, C> = flushEvents;

  function* tableChangeEventSaga(): SagaIterator {
    const changeChannel = yield actionChannel(config.actions.handleEvent.toString());

    function* handleDataChangeEvent(
      a: types.Action<tabling.ChangeEvent<"dataChange", R>, C>,
    ): SagaIterator {
      yield delay(200);
      const actions: types.Action<tabling.AnyChangeEvent<R>, C>[] = yield flush(changeChannel);
      yield call(flusher, config, [a, ...actions]);
    }

    function* handleRowAddEvent(
      a: types.Action<tabling.ChangeEvent<"rowAddData", R>, C>,
    ): SagaIterator {
      /* Buffer and flush data change events and new row events that occur every 500ms - this is
         particularly important for dragging cell values to update other cell values as it submits a
         separate DataChangeEvent for every new cell value. */
      yield delay(500);
      const actions: types.Action<tabling.AnyChangeEvent<R>, C>[] = yield flush(changeChannel);
      yield call(flusher, config, [a, ...actions]);
    }

    function* handleChangeEvent(a: types.Action<tabling.AnyChangeEvent<R>, C>): SagaIterator {
      const e: tabling.AnyChangeEvent<R> = a.payload;
      if (tabling.isTableEventOfType(e, "dataChange")) {
        yield call(
          handleDataChangeEvent,
          a as types.Action<tabling.ChangeEvent<"dataChange", R>, C>,
        );
      } else if (
        /* We do not want to buffer RowAdd events if the row is being added either by the
           RowAddIndexPayload or the RowAddCountPayload. */
        tabling.isTableEventOfType(e, "rowAddData")
      ) {
        yield call(handleRowAddEvent, a as types.Action<tabling.ChangeEvent<"rowAddData", R>, C>);
      } else {
        yield call(config.tasks.handleChangeEvent, e, a.context);
      }
    }

    while (true) {
      const action: types.Action<tabling.AnyTableEvent<R, M>, C> = yield take(changeChannel);
      const e: tabling.AnyTableEvent<R, M> = action.payload;
      const store = yield select((s: types.ApplicationStore) =>
        config.selectStore(s, action.context),
      );
      if (tabling.isChangeEvent(e)) {
        yield call(
          handleChangeEvent,
          action as types.Action<tabling.ChangeEvent<"dataChange", R>, C>,
        );
      } else if (tabling.isMetaEvent(e)) {
        if (e.type === "forward") {
          const redoEvent = tabling.getRedoEvent<R>(store);
          if (redoEvent !== undefined) {
            yield call(handleChangeEvent, { ...action, payload: redoEvent });
          }
        } else {
          const undoEvent = tabling.getUndoEvent<R>(store);
          if (undoEvent !== undefined) {
            yield call(handleChangeEvent, { ...action, payload: undoEvent });
          }
        }
      }
    }
  }
  /* There are some tables, like the FringesTable, that are displayed in a modal and the task set
     associated with them does not include a request task, because the request task is performed
     inside the task set of the Account or SubAccount.

	   In this case, the Saga is just used to listen for change events - not make requests and
     populate the table data, and the base public table saga will detect that there is no request
     task and not introduce a saga to listen for the request action. */
  const baseTableSaga: Saga = createPublicTableSaga<R, M, S, C>(config);
  function* rootSaga(): SagaIterator {
    yield spawn(baseTableSaga);
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
