import { filter } from "lodash";
import { SagaIterator } from "redux-saga";
import { put, fork, select, call } from "redux-saga/effects";

import * as api from "api";
import { tabling, notifications, http, redux } from "lib";

import * as actions from "../actions";

type R = Tables.ContactRowData;
type M = Model.Contact;
type P = Http.ContactPayload;
type TC = Redux.ActionContext;

export function* request(context?: Redux.ActionContext): SagaIterator {
  const requestCached = yield select((s: Application.Store) =>
    redux.canUseCachedListResponse(s.contacts),
  );
  const filteredQuery: Http.ListQuery = yield select((state: Application.Store) => ({
    search: state.filteredContacts.search,
  }));
  if (!requestCached) {
    yield put(actions.loadingContactsAction(true, {}));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, context);
      yield put(actions.responseContactsAction(response, {}));
      /* Only set the filtered contacts at the same time if there isn't an active
         search. */
      if (filteredQuery.search !== "") {
        yield put(actions.responseFilteredContactsAction(response, {}));
      }
    } catch (e: unknown) {
      notifications.ui.banner.handleRequestError(e as Error, {
        message: context?.errorMessage || "There was an error retrieving the contacts.",
      });
      // Non api.RequestError will be thrown in the above block.
      yield put(
        actions.responseContactsAction(
          { count: 0, data: [], error: e as api.RequestError, query: {} },
          {},
        ),
      );
      /* Only set the filtered contacts at the same time if there isn't an active
         search. */
      if (filteredQuery.search !== "") {
        yield put(
          actions.responseFilteredContactsAction(
            { count: 0, data: [], error: e as api.RequestError, query: {} },
            {},
          ),
        );
      }
    } finally {
      yield put(actions.loadingContactsAction(false, {}));
    }
  }
}

export function* requestFiltered(context?: Redux.ActionContext): SagaIterator {
  const query: Http.ListQuery = yield select((state: Application.Store) => ({
    search: state.filteredContacts.search,
  }));
  const requestCached = yield select((s: Application.Store) =>
    redux.canUseCachedListResponse(s.filteredContacts, query),
  );
  if (!requestCached) {
    yield put(actions.loadingFilteredContactsAction(true, {}));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, context, query);
      yield put(actions.responseFilteredContactsAction(response, {}));
    } catch (e: unknown) {
      notifications.ui.banner.handleRequestError(e as Error, {
        message: context?.errorMessage || "There was an error retrieving the contacts.",
      });
      // Non api.RequestError will be thrown in the above block.
      yield put(
        actions.responseFilteredContactsAction({ error: e as api.RequestError, query }, {}),
      );
    } finally {
      yield put(actions.loadingFilteredContactsAction(false, {}));
    }
  }
}

export const createTableTaskSet = (
  config: Table.TaskConfig<
    R,
    M,
    Tables.ContactTableStore,
    Redux.ActionContext,
    Redux.AuthenticatedTableActionCreatorMap<R, M>
  >,
): Redux.AuthenticatedTableTaskMap<R, TC> => {
  function* tableRequest(action: Redux.Action<Redux.TableRequestPayload, TC>): SagaIterator {
    yield put(config.actions.loading(true, {}));
    try {
      const response: Http.ListResponse<M> = yield http.request(api.getContacts, action.context);
      yield put(config.actions.response({ models: response.data }, {}));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an loading the table data.",
        dispatchClientErrorToSentry: true,
      });
      yield put(config.actions.response({ models: [], error: e as api.RequestError }, {}));
    } finally {
      yield put(config.actions.loading(false, {}));
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: TC) => SagaIterator = tabling.createBulkTask(
    {
      table: config.table,
      service: () => api.bulkCreateContacts,
      selectStore: config.selectStore,
      responseActions: (ctx: TC, r: Http.ChildListResponse<M>, e: Table.RowAddEvent<R>) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.placeholderIds, models: r.children },
          },
          ctx,
        ),
      ],
      performCreate: (
        ctx: Redux.WithActionContext<TC>,
        p: Http.BulkCreatePayload<Http.ContactPayload>,
      ): [Http.BulkCreatePayload<Http.ContactPayload>] => [p],
    },
  );

  function* bulkUpdateTask(ctx: TC, requestPayload: Http.BulkUpdatePayload<P>): SagaIterator {
    config.table.saving(true);
    try {
      yield http.request(api.bulkUpdateContacts, ctx, requestPayload);
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: TC, ids: number[]): SagaIterator {
    config.table.saving(true);
    try {
      yield http.request(api.bulkDeleteContacts, ctx, { ids });
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error removing the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: TC): SagaIterator {
    const response: M = yield http.request(api.createContact, ctx, {
      previous: e.payload.previous,
      ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
    });
    yield put(
      config.actions.handleEvent({ type: "modelsAdded", payload: { model: response } }, {}),
    );
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: TC): SagaIterator {
    const response: M = yield http.request(api.updateContact, ctx, e.payload.id, {
      previous: e.payload.previous,
    });
    yield put(
      config.actions.handleEvent({ type: "modelsUpdated", payload: { model: response } }, {}),
    );
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: TC): SagaIterator {
    yield call(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: TC): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(
    e: Table.DataChangeEvent<R, Table.ModelRow<R>>,
    ctx: TC,
  ): SagaIterator {
    const merged = tabling.events.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, M, P>(
        merged,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  return {
    request: tableRequest,
    handleChangeEvent: tabling.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: tabling.task(
        handleRowInsertEvent,
        config.table,
        "There was an error adding the table rows.",
      ),
      rowPositionChanged: tabling.task(
        handleRowPositionChangedEvent,
        config.table,
        "There was an error moving the table rows.",
      ),
      /*
			It is safe to assume that the ID of the row for which data is being
			changed will always be a ModelRowId - but we have to force coerce that
			here.
			*/
      dataChange: handleDataChangeEvent as Redux.TableChangeEventTask<
        Table.DataChangeEvent<R>,
        R,
        TC
      >,
    }),
  };
};
