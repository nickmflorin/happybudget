import { SagaIterator } from "redux-saga";
import { put, call, select } from "redux-saga/effects";

import { tabling, notifications, model } from "lib";

import * as api from "../../api";
import * as actions from "../actions";
import * as types from "../types";

import * as cache from "./cache";
import { createBulkCreateTask, createChangeEventHandler } from "./tabling";

type R = model.ContactRow;
type M = model.Contact;
type P = api.ContactPayload;
type TableContext = types.ActionContext;

export function* requestContacts(context?: types.ActionContext): SagaIterator {
  const requestCached = yield select((s: types.ApplicationStore) =>
    cache.canUseCachedListResponse(s.contacts),
  );
  const filteredQuery: api.ListQuery = yield select((state: types.ApplicationStore) => ({
    search: state.filteredContacts.search,
  }));
  if (!requestCached) {
    yield put(actions.loadingContactsAction(true, {}));
    const response: Awaited<ReturnType<typeof api.getContacts>> = yield call(api.getContacts);
    if (response.error) {
      notifications.ui.banner.handleRequestError(response.error, {
        message: context?.errorMessage || "There was an error retrieving the contacts.",
      });
    }
    yield put(actions.responseContactsAction(response, {}));
    // Only set the filtered contacts at the same time if there isn't an active search.
    if (filteredQuery.search !== "") {
      yield put(actions.responseFilteredContactsAction(response, {}));
    }
    yield put(actions.loadingContactsAction(false, {}));
  }
}

export function* requestFilteredContacts(context?: types.ActionContext): SagaIterator {
  const query: api.ListQuery = yield select((state: types.ApplicationStore) => ({
    search: state.filteredContacts.search,
  }));
  const requestCached = yield select((s: types.ApplicationStore) =>
    cache.canUseCachedListResponse(s.filteredContacts, query),
  );
  if (!requestCached) {
    yield put(actions.loadingFilteredContactsAction(true, {}));
    const response: Awaited<ReturnType<typeof api.getContacts>> = yield call(api.getContacts, {
      query,
    });
    if (response.error) {
      notifications.ui.banner.handleRequestError(response.error, {
        message: context?.errorMessage || "There was an error retrieving the contacts.",
      });
    }
    yield put(actions.responseFilteredContactsAction(response, {}));
    yield put(actions.loadingFilteredContactsAction(false, {}));
  }
}

export const createContactsTableTaskSet = (
  config: types.TableTaskConfig<
    R,
    M,
    types.ContactTableStore,
    TableContext,
    types.AuthenticatedTableActionPayloadMap<R>
  >,
): types.AuthenticatedTableTaskMap<R, TableContext> => {
  function* tableRequest(
    action: types.Action<types.TableRequestActionPayload, TableContext>,
  ): SagaIterator {
    yield put(config.actions.loading(true, {}));
    const response: Awaited<ReturnType<typeof api.getContacts>> = yield call(api.getContacts);
    if (response.error) {
      config.table.handleRequestError(response.error, {
        message: action.context.errorMessage || "There was an loading the table data.",
        dispatchClientErrorToSentry: true,
      });
      yield put(config.actions.response({ models: [], error: response.error }, {}));
    } else {
      yield put(config.actions.response({ models: response.response.data }, {}));
    }
    yield put(config.actions.loading(false, {}));
  }

  const bulkCreateTask: (e: tabling.RowAddEvent<R>, ctx: TableContext) => SagaIterator =
    createBulkCreateTask<R, M, api.ContactPayload, api.ChildListResponse<M>, TableContext>({
      table: config.table,
      selectStore: config.selectStore,
      responseActions: (
        ctx: TableContext,
        r: api.ChildListResponse<M>,
        e: tabling.RowAddEvent<R>,
      ) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.payload.placeholderIds, models: r.children },
          },
          ctx,
        ),
      ],
      performCreate:
        (ctx: TableContext, p: api.BulkCreatePayload<api.ContactPayload>) => async () =>
          api.bulkCreateContacts({ body: p }),
    });

  function* bulkUpdateTask(
    ctx: TableContext,
    requestPayload: api.BulkUpdatePayload<P>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkUpdateContacts>> = yield call(
      api.bulkUpdateContacts,
      { body: requestPayload },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true,
      });
    }
    config.table.saving(false);
  }

  function* bulkDeleteTask(ctx: TableContext, ids: number[]): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkDeleteContacts>> = yield call(
      api.bulkDeleteContacts,
      { body: { ids } },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true,
      });
    }
    config.table.saving(false);
  }

  function* handleRowInsertEvent(
    e: tabling.ChangeEvent<"rowInsert", R>,
    ctx: TableContext,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createContact>> = yield call(api.createContact, {
      body: {
        previous: e.payload.previous,
        ...tabling.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
      },
    });
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsAdded",
            payload: { model: r.response },
          },
          ctx,
        ),
      );
    }
    config.table.saving(false);
  }

  function* handleRowPositionChangedEvent(
    e: tabling.ChangeEvent<"rowPositionChanged", R>,
    ctx: TableContext,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.updateContact>> = yield call(
      api.updateContact,
      { id: e.payload.id },
      { body: { previous: e.payload.previous } },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: { model: r.response },
          },
          ctx,
        ),
      );
    }
    config.table.saving(false);
  }

  function* handleRowAddEvent(e: tabling.RowAddEvent<R>, ctx: TableContext): SagaIterator {
    config.table.saving(true);
    yield call(bulkCreateTask, e, ctx);
    config.table.saving(false);
  }

  function* handleRowDeleteEvent(
    e: tabling.ChangeEvent<"rowDelete", R>,
    ctx: TableContext,
  ): SagaIterator {
    const ids: tabling.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = ids.filter((id: tabling.RowId) => tabling.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      config.table.saving(true);
      yield call(bulkDeleteTask, ctx, modelRowIds);
      config.table.saving(false);
    }
  }

  function* handleDataChangeEvent(
    e: tabling.ChangeEvent<"dataChange", R>,
    ctx: TableContext,
  ): SagaIterator {
    const merged = tabling.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.createBulkUpdatePayload<R, M, P>(
        merged,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield call(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  return {
    request: tableRequest,
    handleChangeEvent: createChangeEventHandler({
      rowAddData: handleRowAddEvent,
      rowAddIndex: handleRowAddEvent,
      rowAddCount: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: handleRowInsertEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      dataChange: handleDataChangeEvent,
    }),
  };
};
