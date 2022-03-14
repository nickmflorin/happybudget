import { SagaIterator } from "redux-saga";
import { put, call, fork, select, all } from "redux-saga/effects";
import { filter, isNil } from "lodash";

import * as api from "api";
import { tabling, contacts, notifications } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;
type P = Http.ActualPayload;
type CTX = Redux.WithActionContext<Tables.ActualTableContext>;

export type ActualsTableActionMap = Redux.AuthenticatedTableActionMap<R, M, Tables.ActualTableContext> & {
  readonly loadingActualOwners: Redux.ActionCreator<boolean>;
  readonly responseActualOwners: Redux.ActionCreator<Http.ListResponse<Model.ActualOwner>>;
  readonly responseActualTypes: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Budget>>;
};

export type ActualsTableTaskConfig = Table.TaskConfig<
  R,
  M,
  Tables.ActualTableStore,
  Tables.ActualTableContext,
  ActualsTableActionMap
> & {
  readonly selectOwnersSearch: (state: Application.Store) => string;
};

export type ActualsAuthenticatedTableTaskMap = Redux.AuthenticatedTableTaskMap<R, Tables.ActualTableContext> & {
  readonly requestActualOwners: Redux.ContextTask<null, Tables.ActualTableContext>;
};

export const createTableTaskSet = (config: ActualsTableTaskConfig): ActualsAuthenticatedTableTaskMap => {
  const contactsTasks = contacts.tasks.createTaskSet();

  function* requestActualTypes(ctx: CTX): SagaIterator {
    const response = yield api.request(api.getActualTypes, ctx);
    yield put(config.actions.responseActualTypes(response));
  }

  function* requestActuals(ctx: CTX): SagaIterator {
    const response: Http.ListResponse<M> = yield api.request(api.getActuals, ctx, ctx.budgetId);
    if (response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const createResponse: Http.ServiceResponse<typeof api.bulkCreateActuals> = yield api.request(
        api.bulkCreateActuals,
        ctx,
        ctx.budgetId,
        { data: [{}, {}] }
      );
      yield put(config.actions.response({ models: createResponse.children }));
    } else {
      yield put(config.actions.response({ models: response.data }));
    }
  }

  function* requestActualOwners(action: Redux.TableAction<null, Tables.ActualTableContext>): SagaIterator {
    const search = yield select(config.selectOwnersSearch);
    yield put(config.actions.loadingActualOwners(true));
    try {
      const response = yield api.request(api.getBudgetActualOwners, action.context, action.context.budgetId, {
        search,
        page_size: 10
      });
      yield put(config.actions.responseActualOwners(response));
    } catch (e: unknown) {
      /* Note: This is not ideal, as we might wind up with multiple table
         table notifications from this request and the requet to get the actuals.
				 */
      config.table.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseActualOwners({ count: 0, data: [] }));
    } finally {
      yield put(config.actions.loadingActualOwners(false));
    }
  }

  function* request(action: Redux.TableAction<Redux.TableRequestPayload, Tables.ActualTableContext>): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      yield all([
        call(requestActuals, action.context),
        call(requestActualTypes, action.context),
        call(requestActualOwners, action as Redux.TableAction<null, Tables.ActualTableContext>),
        call(contactsTasks.request, action as Redux.TableAction<null>)
      ]);
    } catch (e: unknown) {
      const err = e as Error;
      if (
        err instanceof api.ClientError &&
        !isNil(err.permissionError) &&
        err.permissionError.code === api.ErrorCodes.PRODUCT_PERMISSION_ERROR
      ) {
        notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
      } else {
        config.table.handleRequestError(e as Error, {
          message: action.context.errorMessage || "There was an error retrieving the table data.",
          dispatchClientErrorToSentry: true
        });
      }
      yield put(config.actions.response({ models: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: CTX) => SagaIterator = tabling.tasks.createBulkTask({
    table: config.table,
    service: api.bulkCreateActuals,
    selectStore: config.selectStore,
    responseActions: (ctx: CTX, r: Http.ParentChildListResponse<Model.Budget, M>, e: Table.RowAddEvent<R>) => [
      config.actions.handleEvent(
        {
          type: "placeholdersActivated",
          payload: { placeholderIds: e.placeholderIds, models: r.children }
        },
        ctx
      ),
      config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent })
    ],
    performCreate: (
      ctx: CTX,
      p: Http.BulkCreatePayload<Http.ActualPayload>
    ): [number, Http.BulkCreatePayload<Http.ActualPayload>] => [ctx.budgetId, p]
  });

  function* bulkUpdateTask(ctx: CTX, requestPayload: Http.BulkUpdatePayload<P>): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.ServiceResponse<typeof api.bulkUpdateActuals> = yield api.request(
        api.bulkUpdateActuals,
        ctx,
        ctx.budgetId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: CTX, ids: number[]): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.ServiceResponse<typeof api.bulkDeleteActuals> = yield api.request(
        api.bulkDeleteActuals,
        ctx,
        ctx.budgetId,
        { ids }
      );
      yield put(config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.updateActual, ctx, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: { model: response }
          },
          ctx
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.createActual, ctx, ctx.budgetId, {
        previous: e.payload.previous,
        ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns())
      });
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsAdded",
            payload: { model: response }
          },
          ctx
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: Tables.ActualTableContext): SagaIterator {
    yield fork(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: Tables.ActualTableContext): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>, ctx: Tables.ActualTableContext): SagaIterator {
    const merged = tabling.events.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, M, P>(merged, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  return {
    request,
    requestActualOwners,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowInsert: handleRowInsertEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowPositionChanged: handleRowPositionChangedEvent
    })
  };
};
