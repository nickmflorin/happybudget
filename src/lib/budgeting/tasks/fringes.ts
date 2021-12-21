import { SagaIterator } from "redux-saga";
import { put, fork, select } from "redux-saga/effects";
import { map, filter, intersection, reduce } from "lodash";
import { createSelector } from "reselect";

import * as api from "api";
import { tabling, budgeting, notifications } from "lib";
import { initialFringesState, initialSubAccountsTableState } from "app/Budget/store/initialState";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type P = Http.FringePayload;

export interface FringeServiceSet {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<M>>;
}

export type FringesTableActionMap<B extends Model.Template | Model.Budget> = Redux.AuthenticatedTableActionMap<
  R,
  M,
  Tables.FringeTableContext
> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
  readonly requestAccount: Redux.ActionCreator<number>;
  readonly requestAccountTableData: Redux.ContextActionCreator<Redux.TableRequestPayload, Tables.FringeTableContext>;
  readonly requestSubAccount: Redux.ActionCreator<number>;
  readonly requestSubAccountTableData: Redux.ContextActionCreator<Redux.TableRequestPayload, Tables.FringeTableContext>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<B>>;
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export type FringeTableServiceSet<B extends Model.Template | Model.Budget> = FringeServiceSet & {
  readonly create: (id: number, payload: P, options?: Http.RequestOptions) => Promise<M>;
  readonly bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BulkDeleteResponse<B>>;
  readonly bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<Http.FringePayload>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, Model.Fringe>>;
  readonly bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, Model.Fringe>>;
};

export type FringesTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  M,
  Tables.FringeTableContext,
  FringesTableActionMap<B>
> & {
  readonly services: FringeTableServiceSet<B>;
  readonly selectAccountTableStore: (state: Application.AuthenticatedStore) => Tables.SubAccountTableStore;
  readonly selectSubAccountTableStore: (state: Application.AuthenticatedStore) => Tables.SubAccountTableStore;
};

export const createTableTaskSet = <B extends Model.Template | Model.Budget>(
  config: FringesTableTaskConfig<B>
): Redux.TableTaskMap<R, M, Tables.FringeTableContext> => {
  const selectPath = (s: Application.AuthenticatedStore) => s.router.location.pathname;

  const selectTableStore = createSelector(
    [selectPath, config.selectAccountTableStore, config.selectSubAccountTableStore],
    (
      path: string,
      acountTableStore: Tables.SubAccountTableStore,
      subaccountTableStore: Tables.SubAccountTableStore
    ) => {
      if (budgeting.urls.isAccountUrl(path)) {
        return acountTableStore.fringes;
      } else if (budgeting.urls.isSubAccountUrl(path)) {
        return subaccountTableStore.fringes;
      }
      return initialFringesState;
    }
  );

  const selectSubAccountsStore = createSelector(
    [selectPath, config.selectAccountTableStore, config.selectSubAccountTableStore],
    (
      path: string,
      acountTableStore: Tables.SubAccountTableStore,
      subaccountTableStore: Tables.SubAccountTableStore
    ) => {
      if (budgeting.urls.isAccountUrl(path)) {
        return acountTableStore;
      } else if (budgeting.urls.isSubAccountUrl(path)) {
        return subaccountTableStore;
      }
      return initialSubAccountsTableState;
    }
  );

  const bulkCreateTask: Redux.TableBulkCreateTask<R, [number]> = tabling.tasks.createBulkTask<
    R,
    M,
    Tables.FringeTableStore,
    Http.FringePayload,
    Http.BulkResponse<B, M>,
    [number]
  >({
    table: config.table,
    selectStore: selectTableStore,
    loadingActions: [config.actions.saving, config.actions.loadingBudget],
    responseActions: (r: Http.BulkResponse<B, M>, e: Table.RowAddEvent<R>) => [
      config.actions.updateBudgetInState({ id: r.data.id, data: r.data }),
      config.actions.addModelsToState({ placeholderIds: e.placeholderIds, models: r.children })
    ],
    bulkCreate: (objId: number) => [config.services.bulkCreate, objId]
  });

  function* bulkUpdateTask(
    e: Table.ChangeEvent<R, M>,
    requestPayload: Http.BulkUpdatePayload<P>,
    context: Tables.FringeTableContext,
    errorMessage: string
  ): SagaIterator {
    yield put(config.actions.saving(true));
    if (!tabling.typeguards.isGroupEvent(e)) {
      yield put(config.actions.loadingBudget(true));
    }
    try {
      const response: Http.BulkResponse<B, M> = yield api.request(
        config.services.bulkUpdate,
        context.budgetId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      const path = yield select((s: Application.AuthenticatedStore) => s.router.location.pathname);

      const FRINGE_QUANTITATIVE_FIELDS: (keyof Http.FringePayload)[] = ["cutoff", "rate", "unit"];

      const payloadWarrantsRecalculation = (p: Http.ModelBulkUpdatePayload<Http.FringePayload>) => {
        return (
          filter(
            map(FRINGE_QUANTITATIVE_FIELDS, (field: keyof Http.FringePayload) => p[field]),
            (v: Http.FringePayload[keyof Http.FringePayload]) => v !== undefined
          ).length !== 0
        );
      };
      /* If the Fringe(s) that were changed are associated with any models in
			   the active table (either the AccountTable or the SubAccountTable) that
				 need to be recalculated due to the applied changes, we need to request
				 those SubAccount(s) and update them in the table. */
      const fringeIds = reduce(
        requestPayload.data,
        (curr: number[], p: Http.ModelBulkUpdatePayload<Http.FringePayload>) =>
          payloadWarrantsRecalculation(p) ? [...curr, p.id] : curr,
        []
      );
      if (fringeIds.length !== 0) {
        const subaccounts = yield select(selectSubAccountsStore);
        const subaccountsWithFringesChanged: Table.ModelRow<Tables.SubAccountRowData>[] = filter(
          filter(subaccounts.data, (r: Tables.SubAccountRow) => tabling.typeguards.isModelRow(r)),
          (r: Tables.SubAccountRow) => intersection(r.data.fringes, fringeIds).length !== 0
        ) as Table.ModelRow<Tables.SubAccountRowData>[];
        if (subaccountsWithFringesChanged.length !== 0) {
          if (budgeting.urls.isAccountUrl(path)) {
            yield put(
              config.actions.requestAccountTableData(
                { ids: map(subaccountsWithFringesChanged, (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id) },
                context
              )
            );
            // We also need to update the overall Account or SubAccount.
            yield put(config.actions.requestAccount(context.id));
          } else if (budgeting.urls.isSubAccountUrl(path)) {
            yield put(
              config.actions.requestSubAccountTableData(
                { ids: map(subaccountsWithFringesChanged, (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id) },
                context
              )
            );
            // We also need to update the overall Account or SubAccount.
            yield put(config.actions.requestSubAccount(context.id));
          }
        }
      }
    } catch (err: unknown) {
      config.table.notify({ message: errorMessage, level: "error" });
      notifications.requestError(err as Error);
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
      config.table.notify({ message: errorMessage, level: "error" });
      notifications.requestError(err as Error);
    } finally {
      yield put(config.actions.saving(false));
      yield put(config.actions.loadingBudget(false));
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, context: Tables.FringeTableContext): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(config.services.create, context.budgetId, {
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
      config.table.notify({ message: "There was an error adding the table rows.", level: "error" });
      notifications.requestError(err as Error);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowPositionChangedEvent(
    e: Table.RowPositionChangedEvent,
    context: Tables.FringeTableContext
  ): SagaIterator {
    yield put(config.actions.saving(true));
    try {
      const response: M = yield api.request(api.updateFringe, e.payload.id, {
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
      config.table.notify({ message: "There was an error moving the table rows.", level: "error" });
      notifications.requestError(err as Error);
    } finally {
      yield put(config.actions.saving(false));
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, context: Tables.FringeTableContext): SagaIterator {
    yield fork(bulkCreateTask, e, "There was an error creating the fringes.", context.budgetId);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, context: Tables.FringeTableContext): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, context.budgetId, modelRowIds, "There was an error deleting the rows.");
    }
  }

  function* handleDataChangeEvent(
    e: Table.DataChangeEvent<R, Table.ModelRow<R>>,
    context: Tables.FringeTableContext
  ): SagaIterator {
    const merged = tabling.events.consolidateRowChanges<R, Table.ModelRow<R>>(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.http.createBulkUpdatePayload<R, M, P>(merged, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, e, requestPayload, context, "There was an error updating the rows.");
      }
    }
  }

  return {
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: handleRowInsertEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      /* It is safe to assume that the ID of the row for which data is being
				 changed will always be a ModelRowId - but we have to force coerce that
				 here. */
      dataChange: handleDataChangeEvent as Redux.TableEventTask<Table.DataChangeEvent<R>, R, M>
    })
  };
};
