import { SagaIterator } from "redux-saga";
import { put, call, fork, select, all } from "redux-saga/effects";
import { filter, isNil } from "lodash";

import * as api from "api";
import { tabling, contacts, notifications } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;
type P = Http.ActualPayload;

export type ActualsTableActionMap = Redux.AuthenticatedTableActionMap<R, M, Tables.ActualTableContext> & {
  readonly loadingActualOwners: Redux.ActionCreator<boolean>;
  readonly responseActualOwners: Redux.ActionCreator<Http.ListResponse<Model.ActualOwner>>;
  readonly responseActualTypes: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<Model.Budget>>;
};

export type ActualsTableTaskConfig = Table.TaskConfig<R, M, Tables.ActualTableContext, ActualsTableActionMap> & {
  readonly selectStore: (state: Application.AuthenticatedStore) => Tables.ActualTableStore;
  readonly selectOwnersSearch: (state: Application.AuthenticatedStore) => string;
};

export type ActualsTableTaskMap = Redux.TableTaskMap<R, M, Tables.ActualTableContext> & {
  readonly requestActualOwners: Redux.ContextTask<null, Tables.ActualTableContext>;
};

export const createTableTaskSet = (config: ActualsTableTaskConfig): ActualsTableTaskMap => {
  const contactsTasks = contacts.tasks.createTaskSet({ authenticated: true });

  function* requestActualTypes(): SagaIterator {
    const response = yield api.request(api.getActualTypes);
    yield put(config.actions.responseActualTypes(response));
  }

  function* requestActuals(budgetId: number): SagaIterator {
    const response: Http.ListResponse<M> = yield api.request(api.getActuals, budgetId, {});
    if (response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const createResponse: Http.BulkResponse<Model.Budget, M> = yield api.request(api.bulkCreateActuals, budgetId, {
        data: [{}, {}]
      });
      yield put(config.actions.response({ models: createResponse.children }));
    } else {
      yield put(config.actions.response({ models: response.data }));
    }
  }

  function* requestActualOwners(action: Redux.ActionWithContext<null, Tables.ActualTableContext>): SagaIterator {
    const search = yield select(config.selectOwnersSearch);
    yield put(config.actions.loadingActualOwners(true));
    try {
      const response = yield api.request(api.getBudgetActualOwners, action.context.budgetId, { search, page_size: 10 });
      yield put(config.actions.responseActualOwners(response));
    } catch (e: unknown) {
      /* Note: This is not ideal, as we might wind up with multiple table
         table notifications from this request and the requet to get the actuals.
				 */
      config.table.handleRequestError(e as Error, {
        message: "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseActualOwners({ count: 0, data: [] }));
    } finally {
      yield put(config.actions.loadingActualOwners(false));
    }
  }

  function* request(
    action: Redux.ActionWithContext<Redux.TableRequestPayload, Tables.ActualTableContext>
  ): SagaIterator {
    yield put(config.actions.loading(true));
    try {
      yield all([
        call(requestActuals, action.context.budgetId),
        call(requestActualTypes),
        call(requestActualOwners, action as Redux.ActionWithContext<null, Tables.ActualTableContext>),
        call(contactsTasks.request, action as Redux.Action<null>)
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
          message: "There was an error retrieving the table data.",
          dispatchClientErrorToSentry: true
        });
      }
      yield put(config.actions.response({ models: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }

  const bulkCreateTask: Redux.TableBulkCreateTask<R, [number]> = tabling.tasks.createBulkTask<
    R,
    M,
    Tables.ActualTableStore,
    P,
    Http.BulkResponse<Model.Budget, M>,
    [number]
  >({
    table: config.table,
    selectStore: config.selectStore,
    responseActions: (r: Http.BulkResponse<Model.Budget, M>, e: Table.RowAddEvent<R>) => [
      config.actions.addModelsToState({ placeholderIds: e.placeholderIds, models: r.children }),
      config.actions.updateBudgetInState({ id: r.data.id, data: r.data })
    ],
    bulkCreate: (objId: number) => [api.bulkCreateActuals, objId]
  });

  function* bulkUpdateTask(
    budgetId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.BulkResponse<Model.Budget, M> = yield api.request(api.bulkUpdateActuals, budgetId, requestPayload);
      yield put(config.actions.updateBudgetInState({ id: r.data.id, data: r.data }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, { message: errorMessage, dispatchClientErrorToSentry: true });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(budgetId: number, ids: number[], errorMessage: string): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.BulkDeleteResponse<Model.Budget> = yield api.request(api.bulkDeleteActuals, budgetId, ids);
      yield put(config.actions.updateBudgetInState({ id: r.data.id, data: r.data }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, { message: errorMessage, dispatchClientErrorToSentry: true });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowPositionChangedEvent(
    e: Table.RowPositionChangedEvent,
    context: Tables.ActualTableContext
  ): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.updateActual, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(
        config.actions.tableChanged(
          {
            type: "modelUpdated",
            payload: { model: response }
          },
          context
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, context: Tables.ActualTableContext): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.createActual, context.budgetId, {
        previous: e.payload.previous,
        ...tabling.http.postPayload<R, M, P>(e.payload.data, config.table.getColumns())
      });
      yield put(
        config.actions.tableChanged(
          {
            type: "modelAdded",
            payload: { model: response }
          },
          context
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, context: Tables.ActualTableContext): SagaIterator {
    yield fork(bulkCreateTask, e, "There was an error creating the rows.", context.budgetId);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, context: Tables.ActualTableContext): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, context.budgetId, modelRowIds, "There was an error deleting the rows.");
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>, context: Tables.ActualTableContext): SagaIterator {
    const merged = tabling.events.consolidateRowChanges(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.http.createBulkUpdatePayload<R, M, P>(merged, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, context.budgetId, e, requestPayload, "There was an error updating the rows.");
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
