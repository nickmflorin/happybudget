import { filter } from "lodash";
import { SagaIterator } from "redux-saga";
import { CallEffect, put, call, fork, select, all } from "redux-saga/effects";

import * as api from "api";
import { tabling, http, notifications, redux } from "lib";

import * as contacts from "./contacts";
import * as actions from "../actions";

type R = Tables.ActualRowData;
type M = Model.Actual;
type P = Http.ActualPayload;
type TC = ActualsTableActionContext;

type ActualsTableActionMap = Redux.ActionCreatorMap<
  Omit<Redux.AuthenticatedTableActionPayloadMap<R, M>, "invalidate">,
  TC
> & {
  readonly loadingActualOwners: Redux.ActionCreator<boolean, TC>;
  readonly responseActualOwners: Redux.ActionCreator<
    Http.RenderedListResponse<Model.ActualOwner>,
    TC
  >;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<Model.Budget>>;
};

type ActualsTableTaskConfig = Table.TaskConfig<
  R,
  M,
  Tables.ActualTableStore,
  TC,
  ActualsTableActionMap
> & {
  readonly selectOwnersSearch: (state: Application.Store) => string;
};

type ActualsAuthenticatedTableTaskMap = Redux.AuthenticatedTableTaskMap<R, TC> & {
  readonly requestActualOwners: Redux.Task<null, TC>;
};

const requestActualOwners = (config: ActualsTableTaskConfig) =>
  function* task(action: Redux.Action<null, TC>): SagaIterator {
    const search = yield select(config.selectOwnersSearch);
    yield put(config.actions.loadingActualOwners(true, action.context));
    try {
      const response: Http.ListResponse<Model.ActualOwner> = yield http.request(
        api.getBudgetActualOwners,
        action.context,
        action.context.budgetId,
        { search, page_size: 10 },
      );
      const rs = yield call(() => response);
      return rs as Http.ListResponse<Model.ActualOwner>;
    } finally {
      yield put(config.actions.loadingActualOwners(false, action.context));
    }
  };

const requestSupplementaryTableData = (config: ActualsTableTaskConfig) =>
  function* task(action: Redux.Action<null, TC>): SagaIterator {
    const search = yield select(config.selectOwnersSearch);
    const effects: [
      CallEffect<Redux.ListRequestEffectRTWithError<Model.ActualOwner>>,
      CallEffect<Redux.ListRequestEffectRTWithError<Model.Tag>>,
    ] = [
      redux.wrapListRequestEffect(call(requestActualOwners(config), action), action, {
        query: { search },
        selectStore: (s: Application.Store) => config.selectStore(s, action.context).owners,
      }),
      redux.wrapListRequestEffect(http.request(api.getActualTypes, action.context), action, {
        selectStore: (s: Application.Store) => s.actualTypes,
      }),
    ];
    const [owners, actualTypes]: [
      Http.RenderedListResponse<Model.ActualOwner> | null,
      Http.RenderedListResponse<Model.Tag> | null,
    ] = yield redux.wrapListRequestEffects(effects, {
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
  action: Redux.Action<Redux.TableRequestPayload, TC>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): [CallEffect<Http.ListResponse<Model.Actual>>, CallEffect<any>] => [
  /*
	If any of the requests to obtain the primary data used to render the table
	fail, the entire batch of requests will be cancelled and the table will
	not be rendered.
	*/
  http.request(api.getActuals, action.context, action.context.budgetId),
  /*
	We want to treat the request to fetch the supplementary table data
	separately and as one task, such that we only dispatch one error
	notification in the case that it fails and we can differentiate between
	failed requests to obtain the data necessary to render the table and failed
	requests to obtain the data necessary to ensure the entities related to
	the core table data are present.

	The request to fetch the supplementary table data will not throw a hard error
	in the case that it fails (due to the internal mechanics of the
	wrapListRequestEffects method) - but will instead just return empty list
	response objects.

	Note: We do not want to pass in a potentially forced payload ({force: true})
	to the chained task `requestSupplementaryTableData`.  This is because that
	forced payload referred to the request to fetch the primary table data, not
	the supplementary table data.  We do want to re-request supplementary table
	data in the case that it had already been received.
	*/
  call(requestSupplementaryTableData(config), {
    payload: null,
    type: action.type,
    context: action.context,
  } as Redux.Action<null, TC>),
];

export const createTableTaskSet = (
  config: ActualsTableTaskConfig,
): ActualsAuthenticatedTableTaskMap => {
  function* request(action: Redux.Action<Redux.TableRequestPayload, TC>): SagaIterator {
    // Only perform the request if the data is not already in the store.
    const canUseCachedResponse = yield select((s: Application.Store) =>
      redux.canUseCachedListResponse(config.selectStore(s, action.context)),
    );
    if (!canUseCachedResponse || redux.requestActionIsForced(action)) {
      yield put(config.actions.loading(true, { budgetId: action.context.budgetId }));
      const effects = getRequestEffects(config, action as Redux.Action<Redux.RequestPayload, TC>);
      try {
        /* TODO: We might want to move the contacts request to the batched
        	requests to retrieve the supplementary data. */
        yield fork(contacts.request, action.context);
        const [actuals]: [Http.ListResponse<Model.Actual>] = yield all(effects);
        if (actuals.data.length === 0) {
          // If there is no table data, we want to default create two rows.
          const createResponse: Http.ServiceResponse<typeof api.bulkCreateActuals> =
            yield http.request(api.bulkCreateActuals, action.context, action.context.budgetId, {
              data: [{}, {}],
            });
          yield put(
            config.actions.response(
              { models: createResponse.children },
              { budgetId: action.context.budgetId },
            ),
          );
        } else {
          yield put(
            config.actions.response(
              { models: actuals.data },
              { budgetId: action.context.budgetId },
            ),
          );
        }
      } catch (e: unknown) {
        const err = e as Error;
        if (
          err instanceof api.PermissionError &&
          err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR
        ) {
          notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
        } else {
          config.table.handleRequestError(e as Error, {
            message: action.context.errorMessage || "There was an error retrieving the table data.",
            dispatchClientErrorToSentry: true,
          });
        }
        yield put(
          config.actions.response(
            { error: e as api.RequestError },
            { budgetId: action.context.budgetId },
          ),
        );
      } finally {
        yield put(config.actions.loading(false, { budgetId: action.context.budgetId }));
      }
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: TC) => SagaIterator = tabling.createBulkTask(
    {
      table: config.table,
      service: () => api.bulkCreateActuals,
      selectStore: config.selectStore,
      responseActions: (
        ctx: TC,
        r: Http.ParentChildListResponse<Model.Budget, M>,
        e: Table.RowAddEvent<R>,
      ) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.placeholderIds, models: r.children },
          },
          ctx,
        ),
        config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }, {}),
      ],
      performCreate: (
        ctx: TC,
        p: Http.BulkCreatePayload<Http.ActualPayload>,
      ): [number, Http.BulkCreatePayload<Http.ActualPayload>] => [ctx.budgetId, p],
    },
  );

  function* bulkUpdateTask(ctx: TC, requestPayload: Http.BulkUpdatePayload<P>): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.ServiceResponse<typeof api.bulkUpdateActuals> = yield http.request(
        api.bulkUpdateActuals,
        ctx,
        ctx.budgetId,
        requestPayload,
      );
      yield put(config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }, {}));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: TC, ids: number[]): SagaIterator {
    config.table.saving(true);
    try {
      const r: Http.ServiceResponse<typeof api.bulkDeleteActuals> = yield http.request(
        api.bulkDeleteActuals,
        ctx,
        ctx.budgetId,
        { ids },
      );
      yield put(config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }, {}));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: TC): SagaIterator {
    const response: M = yield http.request(api.updateActual, ctx, e.payload.id, {
      previous: e.payload.previous,
    });
    yield put(
      config.actions.handleEvent(
        {
          type: "modelsUpdated",
          payload: { model: response },
        },
        ctx,
      ),
    );
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: TC): SagaIterator {
    const response: M = yield http.request(api.createActual, ctx, ctx.budgetId, {
      previous: e.payload.previous,
      ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
    });
    yield put(
      config.actions.handleEvent(
        {
          type: "modelsAdded",
          payload: { model: response },
        },
        ctx,
      ),
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

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>, ctx: TC): SagaIterator {
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
    request,
    requestActualOwners: requestActualOwners(config),
    handleChangeEvent: tabling.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
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
    }),
  };
};
