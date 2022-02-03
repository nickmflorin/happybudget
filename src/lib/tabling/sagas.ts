import { Saga, SagaIterator } from "redux-saga";
import { spawn, take, call, cancel, actionChannel, delay, flush, fork } from "redux-saga/effects";
import { isNil, map, isEqual } from "lodash";

import { tabling } from "lib";

export const createPublicTableSaga = <
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
>(
  config: Table.PublicSagaConfig<M, C, A>
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

type Batch<
  E extends Table.ChangeEvent<R, M>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
> = {
  readonly events: E[];
  readonly context: Redux.WithActionContext<C>;
};

type SagaConfigWithRequest<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
> = Table.AuthenticatedSagaConfig<
  R,
  M,
  C,
  Redux.AuthenticatedTableActionMap<R, M, C>,
  Redux.AuthenticatedTableTaskMap<R, M, C>
>;

type SagaConfigWithoutRequest<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
> = Table.AuthenticatedSagaConfig<
  R,
  M,
  C,
  Omit<Redux.AuthenticatedTableActionMap<R, M, C>, "request">,
  Omit<Redux.AuthenticatedTableTaskMap<R, M, C>, "request">
>;

type SagaConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
> = SagaConfigWithRequest<R, M, C> | SagaConfigWithoutRequest<R, M, C>;

const configIsWithRequest = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
>(
  config: SagaConfig<R, M, C>
): config is SagaConfigWithRequest<R, M, C> => (config as SagaConfigWithRequest<R, M, C>).actions.request !== undefined;

/**
 * When we are queueing actions together for the same types of events that happen
 * at high frequency, we cannot batch together events for actions that have
 * differing values for `context`.  This is because when we batch together the
 * events for those actions, the events themselves will be merged together and
 * submitted as a whole, with the `context` property of the action narrowed
 * down to a single value.  If those contexts are the same for all actions in
 * the batch, then we don't have a problem.  But if they differ, then we have
 * to treat entities of the batch differently.
 */
const actionInconsistentWithBatch = <
  E extends Table.DataChangeEvent<R> | Table.RowAddDataEvent<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
>(
  action: Redux.TableAction<E, C>,
  batch: Batch<E, R, M, C>
): boolean => {
  return !isEqual(action.context, batch.context);
};

export const createAuthenticatedTableSaga = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context
>(
  config: SagaConfig<R, M, C>
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
  function* flushEvents(actions: Redux.TableAction<Table.ChangeEvent<R, M>, C>[]): SagaIterator {
    const events: Table.ChangeEvent<R, M>[] = map(
      actions,
      (a: Redux.TableAction<Table.ChangeEvent<R, M>, C>) => a.payload
    );

    function* flushDataBatch(batch: Batch<Table.DataChangeEvent<R>, R, M, C> | null): SagaIterator {
      if (batch !== null && batch.events.length !== 0) {
        const event = tabling.events.consolidateDataChangeEvents(batch.events);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event, batch.context);
        }
      }
    }

    function* flushRowAddBatch(batch: Batch<Table.RowAddDataEvent<R>, R, M, C> | null): SagaIterator {
      if (batch !== null && batch.events.length !== 0) {
        const event = tabling.events.consolidateRowAddEvents(batch.events);
        if (!Array.isArray(event.payload) || event.payload.length !== 0) {
          yield call(config.tasks.handleChangeEvent, event, batch.context);
        }
      }
    }

    let runningDataChangeBatch: Batch<Table.DataChangeEvent<R>, R, M, C> | null = null;
    let runningRowAddBatch: Batch<Table.RowAddDataEvent<R>, R, M, C> | null = null;

    const addEventToBatch = <E extends Table.DataChangeEvent<R> | Table.RowAddDataEvent<R>>(
      batch: Batch<E, R, M, C>,
      action: Redux.TableAction<E, C>
    ): Batch<E, R, M, C> => {
      if (batch.events.length === 0) {
        return {
          ...batch,
          events: [action.payload],
          context: action.context
        };
      } else {
        if (actionInconsistentWithBatch(action, batch)) {
          // This should be prevented before calling this method.
          throw new Error("Action is inconsistent with batch!");
        }
        return { ...batch, events: [...batch.events, action.payload] };
      }
    };

    for (let i = 0; i < events.length; i++) {
      const a = actions[i];
      if (tabling.typeguards.isDataChangeEventAction(a)) {
        /* Queue the row add events when they are happening very close together
           in the time dimension.  If an event comes in that is not semantically
					 "different" from the other events in the currently queued batch,
					 flush the batch and start a new batch. */
        if (runningDataChangeBatch === null) {
          runningDataChangeBatch = {
            events: [a.payload],
            context: a.context
          };
        } else if (actionInconsistentWithBatch<Table.DataChangeEvent<R>, R, M, C>(a, runningDataChangeBatch)) {
          /* If the context of the new event does not match the context of the
             current batch, that means that the context quickly changed before
						 the batch had a chance to flush.  In this case, we need to flush
						 the previous batch and start a new batch. */
          yield fork(flushDataBatch, runningDataChangeBatch);
          runningDataChangeBatch = null;
        } else {
          runningDataChangeBatch = addEventToBatch(runningDataChangeBatch, a);
        }
      } else if (tabling.typeguards.isRowAddEventAction(a) && tabling.typeguards.isRowAddDataEventAction(a)) {
        /* Queue the row add events when they are happening very close together
           in the time dimension.  If an event comes in that is not semantically
					 "different" from the other events in the currently queued batch,
					 flush the batch and start a new batch. */
        if (runningRowAddBatch === null) {
          runningRowAddBatch = {
            events: [a.payload],
            context: a.context
          };
        } else if (actionInconsistentWithBatch(a, runningRowAddBatch)) {
          /* If the context of the new event does not match the context of the
             current batch, that means that the context quickly changed before
						 the batch had a chance to flush.  In this case, we need to flush the
             previous batch and start a new batch. */
          yield fork(flushRowAddBatch, runningRowAddBatch);
          runningRowAddBatch = null;
        } else {
          runningRowAddBatch = addEventToBatch(runningRowAddBatch, a);
        }
      } else {
        /* If the event was anything other than a row add event or a data change
           event, we need to flush the batches for both the queued row add and
           data change events and then handle the new event without queueing
					 it. */
        yield fork(flushDataBatch, runningDataChangeBatch);
        runningDataChangeBatch = null;
        yield fork(flushRowAddBatch, runningRowAddBatch);
        runningRowAddBatch = null;

        yield fork(config.tasks.handleChangeEvent, a.payload, a.context);
      }
    }
    // Cleanup leftover events at the end.
    yield fork(flushDataBatch, runningDataChangeBatch);
    yield fork(flushRowAddBatch, runningRowAddBatch);
  }

  function* tableChangeEventSaga(): SagaIterator {
    const changeChannel = yield actionChannel(config.actions.tableChanged.toString());
    while (true) {
      const action: Redux.TableAction<Table.ChangeEvent<R, M>, C> = yield take(changeChannel);
      const e: Table.ChangeEvent<R, M> = action.payload;

      if (tabling.typeguards.isDataChangeEvent(e)) {
        yield delay(200);
        const actions: Redux.TableAction<Table.ChangeEvent<R, M>, C>[] = yield flush(changeChannel);
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
        const actions: Redux.TableAction<Table.ChangeEvent<R, M>, C>[] = yield flush(changeChannel);
        yield call(flushEvents, [action, ...actions]);
      } else {
        yield call(config.tasks.handleChangeEvent, e, action.context);
      }
    }
  }

  /* There are some tables, like the FringesTable, that are displayed in a modal
     and the task set associated with them does not include a request task,
     because the request task is performed inside the task set of the Account or
     SubAccount.

		 In this case, the Saga is just used to listen for change events - not make
		 requests and populate the table data.
		 */
  let baseTableSaga: Saga | null = null;
  if (configIsWithRequest<R, M, C>(config)) {
    baseTableSaga = createPublicTableSaga<M, C>(config);
  }

  function* rootSaga(): SagaIterator {
    if (!isNil(baseTableSaga)) {
      yield spawn(baseTableSaga);
    }
    yield spawn(tableChangeEventSaga);
  }
  return rootSaga;
};
