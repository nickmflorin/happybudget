import { SagaIterator } from "redux-saga";
import { call, put, select, all } from "redux-saga/effects";

import { tabling, model } from "lib";

import * as api from "../../api";
import * as types from "../types";

export const createChangeEventHandler = <
  R extends tabling.Row,
  C extends types.ActionContext = types.ActionContext,
>(
  handlers: Partial<types.TableChangeEventTaskMapObject<R, C>>,
): types.TableChangeEventTask<tabling.ChangeEventId, R, C> => {
  function* handleChangeEvent<E extends tabling.ChangeEventId>(
    e: tabling.AnyChangeEvent<R>,
    context: C,
  ): SagaIterator {
    const handler = handlers[e.type] as types.TableChangeEventTask<E, R, C>;
    if (handler !== undefined) {
      yield call(handler, e as tabling.ChangeEvent<E, R>, context);
    } else {
      throw new Error(`Detected event type ${e.type} for which a task is not registered!`);
    }
  }
  return handleChangeEvent;
};

type CreateBulkTaskConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
  RSP extends api.ApiSuccessResponse,
  C extends types.ActionContext = types.ActionContext,
  S extends types.TableStore<R> = types.TableStore<R>,
> = {
  readonly table: tabling.TableInstance<R, M>;
  readonly loadingActions?: types.ActionCreator<boolean, C>[];
  readonly responseActions: (
    ctx: C,
    r: RSP,
    e: tabling.ChangeEvent<"rowAddCount" | "rowAddData" | "rowAddIndex">,
  ) => types.Action[];
  readonly selectStore: (state: types.ApplicationStore, ctx: C) => S;
  readonly performCreate: (
    ctx: C,
    p: api.BulkCreatePayload<P>,
  ) => () => Promise<api.ClientResponse<RSP>>;
};

export const createBulkCreateTask = <
  R extends tabling.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
  RSP extends api.ApiSuccessResponse,
  C extends types.ActionContext = types.ActionContext,
  S extends types.TableStore<R> = types.TableStore<R>,
>(
  config: CreateBulkTaskConfig<R, M, P, RSP, C, S>,
) => {
  function* bulkCreateTask(e: tabling.RowAddEvent<R>, ctx: C): SagaIterator {
    const payload:
      | tabling.RowAddDataPayload<R>
      | tabling.RowAddIndexPayload
      | tabling.RowAddCountPayload = e.payload;

    const selectData = (s: types.ApplicationStore) => config.selectStore(s, ctx).data;
    const store: tabling.RowOfType<tabling.BodyRowType, R>[] = yield select(selectData);

    let data: tabling.RowData<R>[];
    if (tabling.isRowAddCountPayload(payload) || tabling.isRowAddIndexPayload(payload)) {
      data = tabling.generateNewRowData(
        { store, ...payload },
        config.table
          .getColumns()
          .filter((cl: tabling.DataColumn<R, M>) => tabling.isBodyColumn(cl)) as tabling.BodyColumn<
          R,
          M
        >[],
      );
    } else {
      data = payload.data;
    }
    /* Note: The logic in the reducer for activating the placeholder rows with real data relies on
       the assumption that the models in the response are in the same order as the placeholder
       numbers. */
    if (payload.placeholderIds.length !== data.length) {
      throw new Error(
        `Only ${payload.placeholderIds.length} placeholder IDs were provided, but ${data.length}
            new rows are being created.`,
      );
    }
    const requestPayload: api.BulkCreatePayload<P> = tabling.createBulkCreatePayload<R, M, P>(
      data,
      config.table
        .getColumns()
        .filter((c: tabling.DataColumn<R, M>) => tabling.isBodyColumn(c)) as tabling.BodyColumn<
        R,
        M
      >[],
    );
    if (config.loadingActions !== undefined) {
      yield all(
        config.loadingActions.map((action: types.ActionCreator<boolean, C>) =>
          put(action(true, ctx)),
        ),
      );
    }
    config.table.saving(true);
    const performCreate = config.performCreate(ctx, requestPayload);
    const response: api.ClientResponse<RSP> = yield call(performCreate);

    if (response.error) {
      config.table.handleRequestError(response.error, {
        message: ctx.errorMessage || "There was an error creating the table rows.",
      });
    } else {
      yield all(
        config
          .responseActions(ctx, response.response, e)
          .map((action: types.Action) => put(action)),
      );
    }
    config.table.saving(false);
  }

  return bulkCreateTask;
};
