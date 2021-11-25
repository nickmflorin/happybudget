import { SagaIterator } from "redux-saga";
import { put, call, fork, select, all } from "redux-saga/effects";
import { map, isNil, filter, intersection, reduce } from "lodash";

import * as api from "api";
import { tabling, budgeting, notifications } from "lib";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type P = Http.FringePayload;

export interface FringeServiceSet {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
}

export type FringesTableActionMap<B extends Model.Template | Model.Budget> = Redux.AuthenticatedTableActionMap<R, M> & {
  readonly loadingBudget: boolean;
  readonly requestAccount: null;
  readonly requestAccountTableData: Redux.TableRequestPayload;
  readonly requestSubAccount: null;
  readonly requestSubAccountTableData: Redux.TableRequestPayload;
  readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
  readonly responseFringeColors: Http.ListResponse<string>;
};

export type FringeTableServiceSet<B extends Model.Template | Model.Budget> = FringeServiceSet & {
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BulkDeleteResponse<B>>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, Model.Fringe>>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, Model.Fringe>>;
};

export type FringesTaskConfig = Redux.TaskConfig<{ loading: boolean; response: Http.ListResponse<Model.Fringe> }> & {
  readonly services: FringeServiceSet;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
};

export type FringesTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  M,
  FringesTableActionMap<B>
> & {
  readonly services: FringeTableServiceSet<B>;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectAccountTableData: (
    state: Application.Authenticated.Store
  ) => Table.BodyRow<Tables.SubAccountRowData>[];
  readonly selectSubAccountTableData: (
    state: Application.Authenticated.Store
  ) => Table.BodyRow<Tables.SubAccountRowData>[];
};

export const createTableTaskSet = <B extends Model.Template | Model.Budget>(
  config: FringesTableTaskConfig<B>
): Redux.TableTaskMap<R, M> => {
  function* request(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      yield put(config.actions.loading(true));
      yield put(config.actions.clear(null));
      try {
        yield all([call(requestFringes, objId), call(requestFringeColors)]);
      } catch (e: unknown) {
        notifications.requestError(e as Error, "There was an error retrieving the table data.");
        yield put(config.actions.response({ models: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  function* requestFringes(objId: number): SagaIterator {
    const response: Http.ListResponse<M> = yield api.request(config.services.request, objId, {});
    if (response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const createResponse: Http.BulkResponse<B, M> = yield api.request(config.services.bulkCreate, objId, {
        data: [{}, {}]
      });
      yield put(config.actions.response({ models: createResponse.children }));
    } else {
      yield put(config.actions.response({ models: response.data }));
    }
  }

  function* requestFringeColors(): SagaIterator {
    const response = yield api.request(api.getFringeColors);
    yield put(config.actions.responseFringeColors(response));
  }

  function* bulkCreateTask(objId: number, e: Table.RowAddEvent<R>, errorMessage: string): SagaIterator {
    const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, M>(
      e.payload,
      config.columns
    );
    yield put(config.actions.saving(true));
    yield put(config.actions.loadingBudget(true));
    try {
      const response: Http.BulkResponse<B, M> = yield api.request(config.services.bulkCreate, objId, requestPayload);
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
      // assumption that the models in the response are in the same order as the placeholder numbers.
      const placeholderIds: Table.PlaceholderRowId[] = map(
        Array.isArray(e.payload) ? e.payload : [e.payload],
        (rowAdd: Table.RowAdd<R>) => rowAdd.id
      );
      yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.children }));
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
      yield put(config.actions.loadingBudget(false));
    }
  }

  function* bulkUpdateTask(
    objId: number,
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    if (!tabling.typeguards.isGroupEvent(e)) {
      yield put(config.actions.loadingBudget(true));
    }
    try {
      const response: Http.BulkResponse<B, M> = yield api.request(config.services.bulkUpdate, objId, requestPayload);
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      const path = yield select((s: Application.Authenticated.Store) => s.router.location.pathname);

      const FRINGE_QUANTITATIVE_FIELDS: (keyof Http.FringePayload)[] = ["cutoff", "rate", "unit"];

      const payloadWarrantsRecalculation = (p: Http.ModelBulkUpdatePayload<Http.FringePayload>) => {
        return (
          filter(
            map(FRINGE_QUANTITATIVE_FIELDS, (field: keyof Http.FringePayload) => p[field]),
            (v: any) => v !== undefined
          ).length !== 0
        );
      };
      // If the Fringe(s) that were changed are associated with any models in the active table
      // (either the AccountTable or the SubAccountTable) that need to be recalculated due to the
      // applied changes, we need to request those SubAccount(s) and update them in the table.
      const fringeIds = reduce(
        requestPayload.data,
        (curr: number[], p: Http.ModelBulkUpdatePayload<Http.FringePayload>) =>
          payloadWarrantsRecalculation(p) ? [...curr, p.id] : curr,
        []
      );
      if (fringeIds.length !== 0) {
        if (budgeting.urls.isAccountUrl(path)) {
          const subaccounts = yield select(config.selectAccountTableData);
          const subaccountsWithFringesChanged: Table.ModelRow<Tables.SubAccountRowData>[] = filter(
            filter(subaccounts, (r: Tables.SubAccountRow) => tabling.typeguards.isModelRow(r)),
            (r: Tables.SubAccountRow) => intersection(r.data.fringes, fringeIds).length !== 0
          ) as Table.ModelRow<Tables.SubAccountRowData>[];
          if (subaccountsWithFringesChanged.length !== 0) {
            yield put(
              config.actions.requestAccountTableData({
                ids: map(subaccountsWithFringesChanged, (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id)
              })
            );
            // We also need to update the overall Account or SubAccount.
            yield put(config.actions.requestAccount(null));
          }
        } else if (budgeting.urls.isSubAccountUrl(path)) {
          const subaccounts = yield select(config.selectSubAccountTableData);
          const subaccountsWithFringesChanged: Table.ModelRow<Tables.SubAccountRowData>[] = filter(
            filter(subaccounts, (r: Tables.SubAccountRow) => tabling.typeguards.isModelRow(r)),
            (r: Tables.SubAccountRow) => intersection(r.data.fringes, fringeIds).length !== 0
          ) as Table.ModelRow<Tables.SubAccountRowData>[];
          yield put(
            config.actions.requestSubAccountTableData({
              ids: map(subaccountsWithFringesChanged, (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id)
            })
          );
          // We also need to update the overall Account or SubAccount.
          yield put(config.actions.requestSubAccount(null));
        }
      }
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      if (!tabling.typeguards.isGroupEvent(e)) {
        yield put(config.actions.loadingBudget(false));
      }
      yield put(config.actions.saving(false));
    }
  }

  function* bulkDeleteTask(budgetId: number, ids: number[], errorMessage: string): SagaIterator {
    yield put(config.actions.saving(true));
    yield put(config.actions.loadingBudget(true));
    try {
      const response: Http.BulkDeleteResponse<B> = yield api.request(config.services.bulkDelete, budgetId, ids);
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
    } catch (err: unknown) {
      notifications.requestError(err as Error, errorMessage);
    } finally {
      yield put(config.actions.saving(false));
      yield put(config.actions.loadingBudget(false));
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(api.updateFringe, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(
        config.actions.tableChanged({
          type: "modelUpdated",
          payload: { model: response }
        })
      );
    } catch (err: unknown) {
      notifications.requestError(err as Error, "There was an error moving the row.");
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      yield fork(bulkCreateTask, objId, e, "There was an error creating the fringes.");
    }
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent): SagaIterator {
    const budgetId: number | null = yield select(config.selectObjId);
    if (!isNil(budgetId)) {
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
      if (modelRowIds.length !== 0) {
        yield fork(bulkDeleteTask, budgetId, modelRowIds, "There was an error deleting the rows.");
      }
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R, Table.ModelRowId>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      const merged = tabling.events.consolidateRowChanges<R, Table.ModelRowId>(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, M>(merged, config.columns);
        if (requestPayload.data.length !== 0) {
          yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error updating the rows.");
        }
      }
    }
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      // It is safe to assume that the ID of the row for which data is being changed
      // will always be a ModelRowId - but we have to force coerce that here.
      dataChange: handleDataChangeEvent as Redux.TableEventTask<Table.DataChangeEvent<R>>
    })
  };
};
