import { SagaIterator } from "redux-saga";
import { put, fork, select, call } from "redux-saga/effects";
import { filter } from "lodash";

import * as api from "api";
import * as store from "store";
import { tabling, notifications, http } from "lib";

import * as actions from "../actions";

type R = Tables.ContactRowData;
type M = Model.Contact;
type P = Http.ContactPayload;
type CTX = Redux.WithActionContext<Tables.ContactTableContext>;

export const createTaskSet = (): Redux.ModelListResponseTaskMap => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.loadingContactsAction(true));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, action.context);
      yield put(actions.responseContactsAction(response));
      yield put(actions.responseFilteredContactsAction(response));
    } catch (e: unknown) {
      notifications.ui.banner.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an error retrieving the contacts."
      });
      yield put(actions.responseContactsAction({ count: 0, data: [] }));
      yield put(actions.responseFilteredContactsAction({ count: 0, data: [] }));
    } finally {
      yield put(actions.loadingContactsAction(false));
    }
  }
  return { request };
};

export const createFilteredTaskSet = (): Redux.ModelListResponseTaskMap => {
  function* request(action: Redux.Action<null>): SagaIterator {
    yield put(actions.loadingFilteredContactsAction(true));
    const query: Http.ListQuery = yield select((state: Application.Store) => ({
      search: state.filteredContacts.search
    }));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, action.context, query);
      yield put(actions.responseFilteredContactsAction(response));
    } catch (e: unknown) {
      notifications.ui.banner.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an error retrieving the contacts."
      });
      yield put(actions.responseFilteredContactsAction({ count: 0, data: [] }));
    } finally {
      yield put(actions.loadingFilteredContactsAction(false));
    }
  }
  return { request };
};

export const createTableTaskSet = (
  config: Table.TaskConfig<
    R,
    M,
    Tables.ContactTableStore,
    Tables.ContactTableContext,
    Redux.AuthenticatedTableActionMap<R, M, Tables.ContactTableContext>
  >
): Redux.AuthenticatedTableTaskMap<R, Tables.ContactTableContext> => {
  function* tableRequest(
    action: Redux.TableAction<Redux.TableRequestPayload, Tables.ContactTableContext>
  ): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, action.context);
      yield put(config.actions.response({ models: response.data }));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an error retrieving the contacts.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.response({ models: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: CTX) => SagaIterator = tabling.tasks.createBulkTask({
    table: config.table,
    service: api.bulkCreateContacts,
    selectStore: config.selectStore,
    responseActions: (ctx: CTX, r: Http.ChildListResponse<M>, e: Table.RowAddEvent<R>) => [
      config.actions.handleEvent(
        {
          type: "placeholdersActivated",
          payload: { placeholderIds: e.placeholderIds, models: r.children }
        },
        ctx
      ),
      store.actions.updateLoggedInUserMetricsAction({ metric: "num_contacts", incrementBy: r.children.length })
    ],
    performCreate: (
      ctx: Redux.WithActionContext<Tables.ContactTableContext>,
      p: Http.BulkCreatePayload<Http.ContactPayload>
    ): [Http.BulkCreatePayload<Http.ContactPayload>] => [p]
  });

  function* bulkUpdateTask(ctx: CTX, requestPayload: Http.BulkUpdatePayload<P>): SagaIterator {
    config.table.saving(true);
    try {
      yield http.request(api.bulkUpdateContacts, ctx, requestPayload);
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: CTX, ids: number[]): SagaIterator {
    config.table.saving(true);
    try {
      yield http.request(api.bulkDeleteContacts, ctx, { ids });
      store.actions.updateLoggedInUserMetricsAction({ metric: "num_contacts", decrementBy: ids.length });
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error removing the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: CTX): SagaIterator {
    const response: M = yield http.request(api.createContact, ctx, {
      previous: e.payload.previous,
      ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns())
    });
    yield put(config.actions.handleEvent({ type: "modelsAdded", payload: { model: response } }, {}));
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: CTX): SagaIterator {
    const response: M = yield http.request(api.updateContact, ctx, e.payload.id, {
      previous: e.payload.previous
    });
    yield put(config.actions.handleEvent({ type: "modelsUpdated", payload: { model: response } }, {}));
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: CTX): SagaIterator {
    yield call(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: CTX): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R, Table.ModelRow<R>>, ctx: CTX): SagaIterator {
    const merged = tabling.events.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, M, P>(merged, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  return {
    request: tableRequest,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: tabling.tasks.task(handleRowInsertEvent, config.table, "There was an error adding the table rows."),
      rowPositionChanged: tabling.tasks.task(
        handleRowPositionChangedEvent,
        config.table,
        "There was an error moving the table rows."
      ),
      /* It is safe to assume that the ID of the row for which data is being
			   changed will always be a ModelRowId - but we have to force coerce that
				 here. */
      dataChange: handleDataChangeEvent as Redux.TableChangeEventTask<
        Table.DataChangeEvent<R>,
        R,
        Tables.ContactTableContext
      >
    })
  };
};
