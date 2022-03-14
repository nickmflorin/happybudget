import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";
import { createSelector } from "reselect";

import * as api from "api";
import { tabling } from "lib";

export const createChangeEventHandler = <R extends Table.RowData, C extends Table.Context = Table.Context>(
  handlers: Partial<Redux.TableChangeEventTaskMapObject<R, C>>
): Redux.TableChangeEventTask<Table.ChangeEvent<R>, R, C> => {
  function* handleChangeEvent<E extends Table.ChangeEvent<R>>(e: E, context: Redux.WithActionContext<C>): SagaIterator {
    const handler = handlers[e.type] as Redux.TableChangeEventTask<E, R, C>;
    yield call(handler, e, context);
  }
  return handleChangeEvent;
};

type CreateBulkTaskConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  SERVICE extends (...args: any[]) => Promise<any>,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = {
  readonly table: Table.TableInstance<R, M>;
  readonly service: SERVICE;
  readonly loadingActions?: Redux.ActionCreator<boolean>[];
  readonly responseActions: (
    ctx: Redux.WithActionContext<C>,
    r: Http.ServiceResponse<SERVICE>,
    e: Table.RowAddEvent<R>
  ) => Redux.Action[];
  readonly selectStore: (state: Application.Store) => S;
  readonly performCreate: (ctx: Redux.WithActionContext<C>, p: Http.BulkCreatePayload<P>) => Parameters<SERVICE>;
};

export const createBulkTask = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  SERVICE extends (...args: any[]) => Promise<any>,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  config: CreateBulkTaskConfig<R, M, P, SERVICE, C, S>
) => {
  const selectData = createSelector(config.selectStore, (store: S) => store.data);

  function* bulkCreateTask(e: Table.RowAddEvent<R>, ctx: Redux.WithActionContext<C>): SagaIterator {
    const payload: Partial<R>[] | Table.RowAddIndexPayload | Table.RowAddCountPayload = e.payload;
    const store: Table.BodyRow<R>[] = yield select(selectData);

    let data: Partial<R>[];
    if (tabling.events.isRowAddCountPayload(payload) || tabling.events.isRowAddIndexPayload(payload)) {
      data = tabling.rows.generateNewRowData(
        { store, ...payload },
        filter(config.table.getColumns(), (cl: Table.DataColumn<R, M>) =>
          tabling.columns.isBodyColumn(cl)
        ) as Table.BodyColumn<R, M>[]
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
            new rows are being created.`
      );
    }
    const requestPayload: Http.BulkCreatePayload<P> = tabling.rows.createBulkCreatePayload<R, M, P>(
      data,
      filter(config.table.getColumns(), (c: Table.DataColumn<R, M>) =>
        tabling.columns.isBodyColumn(c)
      ) as Table.BodyColumn<R, M>[]
    );
    if (!isNil(config.loadingActions)) {
      yield all(map(config.loadingActions, (action: Redux.ActionCreator<boolean>) => put(action(true))));
    }
    config.table.saving(true);
    const performCreate = config.performCreate(ctx, requestPayload);
    try {
      const response: Http.ServiceResponse<SERVICE> = yield api.request(config.service, ctx, ...performCreate);
      yield all(map(config.responseActions(ctx, response, e), (action: Redux.Action) => put(action)));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error creating the table rows."
      });
    } finally {
      if (!isNil(config.loadingActions)) {
        yield all(map(config.loadingActions, (action: Redux.ActionCreator<boolean>) => put(action(false))));
      }
      config.table.saving(false);
    }
  }

  return bulkCreateTask;
};
