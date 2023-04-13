import { SagaIterator } from "redux-saga";
import { CallEffect, put, call, fork, select, all } from "redux-saga/effects";

import { logger } from "internal";
import { tabling, notifications, model } from "lib";

import * as api from "../../../api";
import * as errors from "../../../errors";
import * as actions from "../../actions";
import * as types from "../../types";
import * as cache from "../cache";
import * as contacts from "../contacts";
import { createBulkCreateTask, createChangeEventHandler } from "../tabling";

type R = model.ActualRow;
type M = model.Actual;
type P = api.ActualPayload;
type TableContext = types.ActualsTableActionContext;

type ActualsTableActionPayloadMap = Omit<
  types.AuthenticatedTableActionPayloadMap<R, M>,
  "invalidate"
> & {
  readonly updateBudgetInState: types.UpdateModelPayload<model.Budget>;
  readonly loadingActualOwners: boolean;
  readonly responseActualOwners: api.ClientResponse<api.ApiListResponse<model.ActualOwner>>;
};

type ActualsTableTaskConfig = types.TableTaskConfig<
  R,
  M,
  types.ActualTableStore,
  TableContext,
  ActualsTableActionPayloadMap
> & {
  readonly selectOwnersSearch: (state: types.ApplicationStore) => string;
};

type ActualsAuthenticatedTableTaskMap = types.AuthenticatedTableTaskMap<R, TableContext> & {
  readonly requestActualOwners: types.Task<types.Action<null, TableContext>>;
};

const requestActualOwners = (config: ActualsTableTaskConfig) =>
  function* task(
    action: types.Action<null, TableContext>,
  ): SagaIterator<api.ClientResponse<api.ApiListResponse<model.ActualOwner>>> {
    const search = yield select(config.selectOwnersSearch);
    yield put(config.actions.loadingActualOwners(true, action.context));
    const response: api.ClientResponse<api.ApiListResponse<model.ActualOwner>> = yield call(
      api.getBudgetActualOwners,
      { id: action.context.budgetId },
      { query: { search, page_size: 10 } },
    );
    yield put(config.actions.loadingActualOwners(false, action.context));
    return response;
  };

function* requestActualTypes(): SagaIterator<
  api.ClientResponse<api.ApiListResponse<model.ActualType>>
> {
  const response: api.ClientResponse<api.ApiListResponse<model.ActualType>> = yield call(
    api.getActualTypes,
  );
  return response;
}

const requestSupplementaryTableData = (config: ActualsTableTaskConfig) =>
  function* task(action: types.Action<null, TableContext>): SagaIterator<void> {
    const search = yield select(config.selectOwnersSearch);
    const effects: [
      CallEffect<api.ClientResponse<api.ApiListResponse<model.ActualOwner>> | null>,
      CallEffect<api.ClientResponse<api.ApiListResponse<model.ActualType>> | null>,
    ] = [
      cache.wrapListRequestEffect<model.ActualOwner>(
        call(requestActualOwners(config), action),
        action,
        {
          query: { search },
          selectStore: (s: types.ApplicationStore) => config.selectStore(s, action.context).owners,
        },
      ),
      cache.wrapListRequestEffect<model.ActualType>(call(requestActualTypes), action, {
        selectStore: (s: types.ApplicationStore) => s.actualTypes,
      }),
    ];
    const [owners, actualTypes]: [
      api.ClientResponse<api.ApiListResponse<model.ActualOwner>> | null,
      api.ClientResponse<api.ApiListResponse<model.ActualType>> | null,
    ] = yield cache.wrapListRequestEffects(effects, {
      errorMessage:
        action.context.errorMessage || "There was an error retrieving supplementary table data.",
      table: config.table,
      errorDetail: "The table may not behave as expected.",
    });
    if (owners !== null) {
      yield put(config.actions.responseActualOwners(owners, action.context));
    }
    if (actualTypes !== null) {
      yield put(actions.responseActualTypesAction(actualTypes, action.context));
    }
  };

const getRequestEffects = (
  config: ActualsTableTaskConfig,
  action: types.Action<types.TableRequestActionPayload, TableContext>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): [CallEffect<api.ClientResponse<api.ApiListResponse<model.Actual>>>, CallEffect<void>] => [
  /* If any of the requests to obtain the primary data used to render the table fail, the entire
     batch of requests will be cancelled and the table will not be rendered. */
  call(api.getActuals, { id: action.context.budgetId }),
  /* We want to treat the request to fetch the supplementary table data separately and as one task,
     such that we only dispatch one error notification in the case that it fails and we can
     differentiate between failed requests to obtain the data necessary to render the table and
     failed	requests to obtain the data necessary to ensure the entities related to the core table
     data are present.

     The request to fetch the supplementary table data will not throw a hard error in the case that
     it fails (due to the internal mechanics of the wrapListRequestEffects method) - but will
     instead just return empty list response objects.

     Note: We do not want to pass in a potentially forced payload ({force: true}) to the chained
     task `requestSupplementaryTableData`.  This is because that forced payload referred to the
     request to fetch the primary table data, not the supplementary table data.  We do want to
     re-request supplementary table data in the case that it had already been received. */
  call(requestSupplementaryTableData(config), {
    payload: null,
    type: action.type,
    context: action.context,
  } as types.Action<null, TableContext>),
];

export const createActualsTableTaskSet = (
  config: ActualsTableTaskConfig,
): ActualsAuthenticatedTableTaskMap => {
  function* request(
    action: types.Action<types.TableRequestActionPayload, TableContext>,
  ): SagaIterator {
    // Only perform the request if the data is not already in the store.
    const canUseCachedResponse = yield select((s: types.ApplicationStore) =>
      cache.canUseCachedListResponse(config.selectStore(s, action.context)),
    );
    if (!canUseCachedResponse || types.tableRequestActionIsForced(action)) {
      yield put(config.actions.loading(true, { budgetId: action.context.budgetId }));
      const effects = getRequestEffects(
        config,
        action as types.Action<types.RequestActionPayload, TableContext>,
      );
      /* TODO: We might want to move the contacts request to the batched requests to retrieve the
         supplementary data. */
      yield fork(contacts.requestContacts, action.context);
      const [actuals]: [api.ClientResponse<api.ApiListResponse<model.Actual>>] = yield all(effects);
      if (actuals.error !== undefined) {
        if (
          actuals.error instanceof errors.ApiGlobalError &&
          actuals.error.code === errors.ApiErrorCodes.PRODUCT_PERMISSION_ERROR
        ) {
          notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
        } else {
          config.table.handleRequestError(actuals.error, {
            message: action.context.errorMessage || "There was an error retrieving the table data.",
            dispatchClientErrorToSentry: true,
          });
        }
        yield put(
          config.actions.response({ error: actuals.error }, { budgetId: action.context.budgetId }),
        );
      } else if (actuals.response.data.length === 0) {
        // If there is no table data, we want to default create two rows.
        const newActuals: Awaited<ReturnType<typeof api.bulkCreateActuals>> = yield call(
          api.bulkCreateActuals,
          { id: action.context.budgetId },
          { body: { data: [{}, {}] as api.ActualPayload[] } },
        );
        if (newActuals.error !== undefined) {
          if (
            newActuals.error instanceof errors.ApiGlobalError &&
            newActuals.error.code === errors.ApiErrorCodes.PRODUCT_PERMISSION_ERROR
          ) {
            notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
          } else {
            /* This log might be redundant because the `handleRequestError` method below should
               also issue a log - but we will be refactoring that method anyways in the near
               future. */
            logger.error(
              { error: newActuals.error },
              "Failed to automatically create two rows for actuals table.  The table will be " +
                "shown with no prepopulated rows.",
            );
            config.table.handleRequestError(newActuals.error, {
              message:
                action.context.errorMessage || "There was an error retrieving the table data.",
              dispatchClientErrorToSentry: true,
            });
          }
          /* We should not dispatch the error in the action here because the error is used for the
             cache invalidation of the request to fetch the table data, not the request to auto
             create two rows.  The overall flow here needs to be improved/fixed, which will
             hopefully be addressed soon. */
          yield put(config.actions.response({ models: [] }, { budgetId: action.context.budgetId }));
        } else {
          yield put(
            config.actions.response(
              { models: actuals.response.data },
              { budgetId: action.context.budgetId },
            ),
          );
        }
        yield put(config.actions.loading(false, { budgetId: action.context.budgetId }));
      }
    }
  }

  const bulkCreateTask: (e: tabling.RowAddEvent<R>, ctx: TableContext) => SagaIterator =
    createBulkCreateTask({
      table: config.table,
      selectStore: config.selectStore,
      responseActions: (
        ctx: TableContext,
        r: api.ParentChildListResponse<model.Budget, M>,
        e: tabling.RowAddEvent<R>,
      ) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.payload.placeholderIds, models: r.children },
          },
          ctx,
        ),
        config.actions.updateBudgetInState(
          { id: r.parent.id, data: r.parent },
          { budgetId: ctx.budgetId },
        ),
      ],
      performCreate: (ctx: TableContext, p: api.BulkCreatePayload<api.ActualPayload>) => async () =>
        api.bulkCreateActuals({ id: ctx.budgetId }, { body: p }),
    });

  function* bulkUpdateTask(
    ctx: TableContext,
    requestPayload: api.BulkUpdatePayload<P>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkUpdateActuals>> = yield call(
      api.bulkUpdateActuals,
      { id: ctx.budgetId },
      { body: requestPayload },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.updateBudgetInState(
          { id: r.response.parent.id, data: r.response.parent },
          { budgetId: ctx.budgetId },
        ),
      );
    }
    config.table.saving(false);
  }

  function* bulkDeleteTask(ctx: TableContext, ids: number[]): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkDeleteActuals>> = yield call(
      api.bulkDeleteActuals,
      { id: ctx.budgetId },
      { body: { ids } },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.updateBudgetInState(
          { id: r.response.parent.id, data: r.response.parent },
          { budgetId: ctx.budgetId },
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
    const r: Awaited<ReturnType<typeof api.updateActual>> = yield call(
      api.updateActual,
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

  function* handleRowInsertEvent(
    e: tabling.ChangeEvent<"rowInsert", R>,
    ctx: TableContext,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createActual>> = yield call(
      api.createActual,
      { id: ctx.budgetId },
      {
        body: {
          previous: e.payload.previous,
          ...tabling.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
        },
      },
    );
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

  function* handleRowAddEvent(
    e: tabling.ChangeEvent<"rowAddData" | "rowAddCount" | "rowAddIndex", R>,
    ctx: TableContext,
  ): SagaIterator {
    yield call(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(
    e: tabling.ChangeEvent<"rowDelete">,
    ctx: TableContext,
  ): SagaIterator {
    const ids: tabling.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = ids.filter((id: tabling.RowId) => tabling.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
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
        yield fork(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  return {
    request,
    requestActualOwners: requestActualOwners(config),
    handleChangeEvent: createChangeEventHandler({
      rowAddData: handleRowAddEvent,
      rowAddIndex: handleRowAddEvent,
      rowAddCount: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowInsert: handleRowInsertEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
    }),
  };
};
