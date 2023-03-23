import { isNil, map, filter } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";

import { http } from "lib";

import * as columns from "../columns";
import * as events from "../events";
import * as rows from "../rows";

export const task = <
  E extends Table.ChangeEvent<R>,
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  saga: Redux.TableChangeEventTask<E, R, C>,
  table: Table.TableInstance<R, M>,
  defaultErrorMessage: string,
): Redux.TableChangeEventTask<E, R, C> =>
  function* (e: E, ctx: C): SagaIterator {
    table.saving(true);
    try {
      yield call(saga, e, ctx);
    } catch (err: unknown) {
      if (!isNil(e.onError)) {
        e.onError(err as Error);
      } else {
        table.handleRequestError(err as Error, {
          message: ctx.errorMessage || defaultErrorMessage,
          dispatchClientErrorToSentry: true,
        });
      }
    } finally {
      table.saving(false);
    }
  };

export const createChangeEventHandler = <
  R extends Table.RowData,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  handlers: Partial<Redux.TableChangeEventTaskMapObject<R, C>>,
): Redux.TableChangeEventTask<Table.ChangeEvent<R>, R, C> => {
  function* handleChangeEvent<E extends Table.ChangeEvent<R>>(e: E, context: C): SagaIterator {
    const handler = handlers[e.type] as Redux.TableChangeEventTask<E, R, C> | undefined;
    if (!isNil(handler)) {
      yield call(handler, e, context);
    } else {
      console.error(`Detected event type ${e.type} for which a task is not registered!`);
    }
  }
  return handleChangeEvent;
};

type CreateBulkTaskConfig<
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  P extends Http.PayloadObj,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  SERVICE extends (...args: any[]) => Promise<any>,
  C extends Redux.ActionContext = Redux.ActionContext,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = {
  readonly table: Table.TableInstance<R, M>;
  readonly loadingActions?: Redux.ActionCreator<boolean, C>[];
  readonly service: (ctx: C) => SERVICE;
  readonly responseActions: (
    ctx: C,
    r: Http.ServiceResponse<SERVICE>,
    e: Table.RowAddEvent<R>,
  ) => Redux.Action[];
  readonly selectStore: (state: Application.Store, ctx: C) => S;
  readonly performCreate: (ctx: C, p: Http.BulkCreatePayload<P>) => Parameters<SERVICE>;
};

export const createBulkTask = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  P extends Http.PayloadObj,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  SERVICE extends (...args: any[]) => Promise<any>,
  C extends Redux.ActionContext = Redux.ActionContext,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  config: CreateBulkTaskConfig<R, M, P, SERVICE, C, S>,
) => {
  function* bulkCreateTask(e: Table.RowAddEvent<R>, ctx: C): SagaIterator {
    const payload: Partial<R>[] | Table.RowAddIndexPayload | Table.RowAddCountPayload = e.payload;

    const selectData = (s: Application.Store) => config.selectStore(s, ctx).data;
    const store: Table.BodyRow<R>[] = yield select(selectData);

    let data: Partial<R>[];
    if (events.isRowAddCountPayload(payload) || events.isRowAddIndexPayload(payload)) {
      data = rows.generateNewRowData(
        { store, ...payload },
        filter(config.table.getColumns(), (cl: Table.DataColumn<R, M>) =>
          columns.isBodyColumn(cl),
        ) as Table.BodyColumn<R, M>[],
      );
    } else {
      data = payload;
    }
    /*
    Note: The logic in the reducer for activating the placeholder rows with
    real data relies on the assumption that the models in the response
    are in the same order as the placeholder numbers.
    */
    if (e.placeholderIds.length !== data.length) {
      throw new Error(
        `Only ${e.placeholderIds.length} placeholder IDs were provided, but ${data.length}
            new rows are being created.`,
      );
    }
    const requestPayload: Http.BulkCreatePayload<P> = rows.createBulkCreatePayload<R, M, P>(
      data,
      filter(config.table.getColumns(), (c: Table.DataColumn<R, M>) =>
        columns.isBodyColumn(c),
      ) as Table.BodyColumn<R, M>[],
    );
    if (!isNil(config.loadingActions)) {
      yield all(
        map(config.loadingActions, (action: Redux.ActionCreator<boolean, C>) =>
          put(action(true, ctx)),
        ),
      );
    }
    config.table.saving(true);
    const performCreate = config.performCreate(ctx, requestPayload);
    try {
      const response: Http.ServiceResponse<SERVICE> = yield http.request(
        config.service(ctx),
        ctx,
        ...performCreate,
      );
      yield all(
        map(config.responseActions(ctx, response, e), (action: Redux.Action) => put(action)),
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error creating the table rows.",
      });
    } finally {
      if (!isNil(config.loadingActions)) {
        yield all(
          map(config.loadingActions, (action: Redux.ActionCreator<boolean, C>) =>
            put(action(false, ctx)),
          ),
        );
      }
      config.table.saving(false);
    }
  }

  return bulkCreateTask;
};
