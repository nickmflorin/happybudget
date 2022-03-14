import { SagaIterator } from "redux-saga";
import { put, fork, select } from "redux-saga/effects";
import { map, filter, intersection, reduce } from "lodash";
import { createSelector } from "reselect";

import * as api from "api";
import * as tabling from "../../tabling";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type P = Http.FringePayload;
type CTX = Redux.WithActionContext<Tables.FringeTableContext>;

export type FringesTableActionMap<B extends Model.Template | Model.Budget> = Redux.AuthenticatedTableActionMap<
  R,
  M,
  Tables.FringeTableContext
> & {
  readonly loadingBudget: Redux.ActionCreator<boolean>;
  readonly requestParent: Redux.ActionCreator<number>;
  readonly requestParentTableData: Redux.TableActionCreator<Redux.TableRequestPayload, Tables.SubAccountTableContext>;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<B>>;
};

export type FringesTableTaskConfig<B extends Model.Template | Model.Budget> = Omit<
  Table.TaskConfig<R, M, Tables.FringeTableStore, Tables.FringeTableContext, FringesTableActionMap<B>>,
  "selectStore"
> & {
  readonly selectParentTableStore: (state: Application.Store) => Tables.SubAccountTableStore;
};

export const createTableTaskSet = <B extends Model.Template | Model.Budget>(
  config: FringesTableTaskConfig<B>
): Omit<Redux.AuthenticatedTableTaskMap<R, Tables.FringeTableContext>, "request"> => {
  const selectTableStore = createSelector(
    config.selectParentTableStore,
    (tableStore: Tables.SubAccountTableStore) => tableStore.fringes
  );

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: CTX) => SagaIterator = tabling.tasks.createBulkTask({
    table: config.table,
    service: api.bulkCreateFringes,
    selectStore: selectTableStore,
    responseActions: (ctx: CTX, r: Http.ParentChildListResponse<Model.BaseBudget, M>, e: Table.RowAddEvent<R>) => [
      config.actions.handleEvent(
        {
          type: "placeholdersActivated",
          payload: { placeholderIds: e.placeholderIds, models: r.children }
        },
        ctx
      ),
      config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent as B })
    ],
    performCreate: (
      ctx: CTX,
      p: Http.BulkCreatePayload<Http.FringePayload>
    ): [number, Http.BulkCreatePayload<Http.FringePayload>] => [ctx.budgetId, p]
  });

  function* bulkUpdateTask(ctx: CTX, e: Table.ChangeEvent<R>, requestPayload: Http.BulkUpdatePayload<P>): SagaIterator {
    config.table.saving(true);
    if (!tabling.events.isGroupChangeEvent(e)) {
      yield put(config.actions.loadingBudget(true));
    }
    try {
      const response: Http.ServiceResponse<typeof api.bulkUpdateFringes> = yield api.request(
        api.bulkUpdateFringes,
        ctx,
        ctx.budgetId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: response.parent.id, data: response.parent as B }));

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
        const subaccounts = yield select(config.selectParentTableStore);
        const subaccountsWithFringesChanged: Table.ModelRow<Tables.SubAccountRowData>[] = filter(
          filter(subaccounts.data, (r: Tables.SubAccountRow) => tabling.rows.isModelRow(r)),
          (r: Tables.SubAccountRow) => intersection(r.data.fringes, fringeIds).length !== 0
        ) as Table.ModelRow<Tables.SubAccountRowData>[];
        if (subaccountsWithFringesChanged.length !== 0) {
          yield put(
            config.actions.requestParentTableData(
              { ids: map(subaccountsWithFringesChanged, (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id) },
              ctx
            )
          );
          // We also need to update the overall Account or SubAccount.
          yield put(config.actions.requestParent(ctx.id));
        }
      }
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      if (!tabling.events.isGroupChangeEvent(e)) {
        yield put(config.actions.loadingBudget(false));
      }
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: CTX, ids: number[]): SagaIterator {
    config.table.saving(true);
    yield put(config.actions.loadingBudget(true));
    try {
      const response: Http.ServiceResponse<typeof api.bulkDeleteFringes> = yield api.request(
        api.bulkDeleteFringes,
        ctx,
        ctx.budgetId,
        { ids }
      );
      yield put(config.actions.updateBudgetInState({ id: response.parent.id, data: response.parent as B }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
      yield put(config.actions.loadingBudget(false));
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.createFringe, ctx, ctx.budgetId, {
        previous: e.payload.previous,
        ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns())
      });
      yield put(config.actions.handleEvent({ type: "modelsAdded", payload: { model: response } }, ctx));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: M = yield api.request(api.updateFringe, ctx, e.payload.id, {
        previous: e.payload.previous
      });
      yield put(config.actions.handleEvent({ type: "modelsUpdated", payload: { model: response } }, ctx));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: CTX): SagaIterator {
    yield fork(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: CTX): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R, Table.ModelRow<R>>, ctx: CTX): SagaIterator {
    const merged = tabling.events.consolidateRowChanges<R, Table.ModelRow<R>>(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, M, P>(merged, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, e, requestPayload);
      }
    }
  }

  return {
    handleChangeEvent: tabling.tasks.createChangeEventHandler<R, Tables.FringeTableContext>({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: handleRowInsertEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      /* It is safe to assume that the ID of the row for which data is being
				 changed will always be a ModelRowId - but we have to force coerce that
				 here. */
      dataChange: handleDataChangeEvent as Redux.TableChangeEventTask<Table.DataChangeEvent<R>, R>
    })
  };
};
