import { map, filter, intersection, reduce } from "lodash";
import { SagaIterator } from "redux-saga";
import { put, fork, select, call } from "redux-saga/effects";
import { createSelector } from "reselect";

import * as api from "api";
import { tabling, http } from "lib";

type R = Tables.FringeRowData;
type M = Model.Fringe;
type P = Http.FringePayload;

type TC<B extends Model.Budget | Model.Template> = FringesTableActionContext<
  B,
  Model.Account | Model.SubAccount,
  false
>;

type FringesTableActionMap<B extends Model.Template | Model.Budget> = Redux.ActionCreatorMap<
  Omit<Redux.AuthenticatedTableActionPayloadMap<R, M>, "invalidate">,
  TC<B>
> & {
  readonly requestParent: (
    id: number,
    parentType: "account" | "subaccount",
    payload: Redux.RequestPayload,
    ctx: Omit<TC<B>, "parentType" | "parentId">,
  ) => Redux.Action<
    Redux.RequestPayload,
    AccountActionContext<B, false> | SubAccountActionContext<B, false>
  >;
  readonly requestParentTableData: (
    id: number,
    parentType: "account" | "subaccount",
    payload: Redux.TableRequestPayload,
    ctx: Omit<TC<B>, "parentType" | "parentId">,
  ) => Redux.Action<
    Redux.TableRequestPayload,
    SubAccountsTableActionContext<B, Model.Account | Model.SubAccount, false>
  >;
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<B>>;
  readonly invalidate: {
    readonly account: Redux.ActionCreator<null, AccountActionContext<B, false>>;
    readonly subaccount: Redux.ActionCreator<null, SubAccountActionContext<B, false>>;
    readonly accountSubAccountsTable: Redux.ActionCreator<
      null,
      SubAccountsTableActionContext<B, Model.Account, false>
    >;
    readonly subaccountSubAccountsTable: Redux.ActionCreator<
      null,
      SubAccountsTableActionContext<B, Model.SubAccount, false>
    >;
  };
};

export type FringesTableTaskConfig<B extends Model.Template | Model.Budget> = Omit<
  Table.TaskConfig<R, M, Tables.FringeTableStore, TC<B>, FringesTableActionMap<B>>,
  "selectStore"
> & {
  readonly selectBaseStore: (state: Application.Store) => Modules.BudgetStoreLookup<B, false>;
  readonly selectParentTableStore: (
    state: Application.Store,
    ctx: TC<B>,
  ) => Tables.SubAccountTableStore;
};

export const createTableTaskSet = <B extends Model.Template | Model.Budget>(
  config: FringesTableTaskConfig<B>,
): Omit<Redux.AuthenticatedTableTaskMap<R, TC<B>>, "request"> => {
  const selectTableStore = createSelector(
    config.selectBaseStore,
    (tableStore: Modules.BudgetStoreLookup<B, false>) => tableStore.fringes,
  );

  function* invalidateAccount(ctx: TC<B>, id: number): SagaIterator {
    const passThroughCtx = { domain: ctx.domain, public: ctx.public, budgetId: ctx.budgetId };
    yield put(
      config.actions.invalidate.accountSubAccountsTable(null, {
        ...passThroughCtx,
        parentType: "account",
        parentId: id,
      }),
    );
    yield put(
      config.actions.invalidate.account(null, {
        ...passThroughCtx,
        id,
      }),
    );
  }

  function* invalidateSubAccount(ctx: TC<B>, id: number): SagaIterator {
    const passThroughCtx = { domain: ctx.domain, public: ctx.public, budgetId: ctx.budgetId };
    yield put(
      config.actions.invalidate.subaccountSubAccountsTable(null, {
        ...passThroughCtx,
        parentType: "subaccount",
        parentId: id,
      }),
    );
    yield put(
      config.actions.invalidate.subaccount(null, {
        ...passThroughCtx,
        id,
      }),
    );
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: TC<B>) => SagaIterator =
    tabling.createBulkTask({
      table: config.table,
      service: () => api.bulkCreateFringes,
      selectStore: selectTableStore,
      responseActions: (
        ctx: TC<B>,
        r: Http.ParentChildListResponse<Model.BaseBudget, M>,
        e: Table.RowAddEvent<R>,
      ) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.placeholderIds, models: r.children },
          },
          ctx,
        ),
        config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent as B }, {}),
      ],
      performCreate: (
        ctx: TC<B>,
        p: Http.BulkCreatePayload<Http.FringePayload>,
      ): [number, Http.BulkCreatePayload<Http.FringePayload>] => [ctx.budgetId, p],
    });

  function* bulkUpdateTask(
    ctx: TC<B>,
    e: Table.ChangeEvent<R>,
    requestPayload: Http.BulkUpdatePayload<P>,
  ): SagaIterator {
    config.table.saving(true);
    try {
      const response: Http.ServiceResponse<typeof api.bulkUpdateFringes> = yield http.request(
        api.bulkUpdateFringes,
        ctx,
        ctx.budgetId,
        requestPayload,
      );
      yield put(
        config.actions.updateBudgetInState(
          { id: response.parent.id, data: response.parent as B },
          {},
        ),
      );

      const FRINGE_QUANTITATIVE_FIELDS: (keyof Http.FringePayload)[] = ["cutoff", "rate", "unit"];

      const payloadWarrantsRecalculation = (p: Http.ModelBulkUpdatePayload<Http.FringePayload>) =>
        filter(
          map(FRINGE_QUANTITATIVE_FIELDS, (field: keyof Http.FringePayload) => p[field]),
          (v: Http.FringePayload[keyof Http.FringePayload]) => v !== undefined,
        ).length !== 0;
      /*
			If any changes to the Fringe(s) affect calculations of SubAccount(s) that
			are associated with those Fringe(s), then the SubAccount(s) need to be
			updated such that their values reflect the changes to the relevant
			Fringe(s).

			For the active SubAccount(s) table being shown (where that SubAccount(s)
			table can either be the SubAccount(s) belonging to an Account or another
			SubAccount), we need to submit a request to refresh the table data with
			the fresh SubAccount(s) from the API that have been recalculated.
			Additionally, we need to submit a request to update the parent Account
			or SubAccount that the refreshed SubAccount(s) in the table belong to.

			However, this does not just affect the SubAccount(s) or parent Account/
			SubAccount that are currently being displayed - but will potentially
			affect SubAccount(s) in tables already cached in the store or parent
			Account/SubAccount(s) that are also already cached in the store.

			To fix this, we must invalidate those objects such that when the user
			revisits the page showing a table with the affected SubAccount(s) or
			parent Account/SubAccount, the tasks will not used the cached results
			but instead request fresh results from the API.
			*/
      /* Determine the IDs of the Fringe(s) that were changed in a manner which
         causes the related SubAccount(s) to need recalculation. */
      const fringeIds = reduce(
        requestPayload.data,
        (curr: number[], p: Http.ModelBulkUpdatePayload<Http.FringePayload>) =>
          payloadWarrantsRecalculation(p) ? [...curr, p.id] : curr,
        [],
      );

      const getSubAccounts = (
        s: Tables.SubAccountTableStore,
      ): Table.ModelRow<Tables.SubAccountRowData>[] =>
        filter(
          filter(s.data, (r: Tables.SubAccountRow) => tabling.rows.isModelRow(r)),
          (r: Tables.SubAccountRow) => intersection(r.data.fringes, fringeIds).length !== 0,
        ) as Table.ModelRow<Tables.SubAccountRowData>[];

      if (fringeIds.length !== 0) {
        const subaccounts: Tables.SubAccountTableStore = yield select((s: Application.Store) =>
          config.selectParentTableStore(s, ctx),
        );
        // Determine what SubAccount(s) are related to the changed Fringe(s).
        const subaccountsWithFringesThatChanged = getSubAccounts(subaccounts);

        /* Request fresh table data and parent data for the table and parent
           currently being viewed. */
        if (subaccountsWithFringesThatChanged.length !== 0) {
          yield put(
            config.actions.requestParentTableData(
              ctx.parentId,
              ctx.parentType,
              {
                ids: map(
                  subaccountsWithFringesThatChanged,
                  (r: Table.ModelRow<Tables.SubAccountRowData>) => r.id,
                ),
              },
              ctx,
            ),
          );
          yield put(
            config.actions.requestParent(ctx.parentId, ctx.parentType, { force: true }, ctx),
          );
        }
        const store: Modules.BudgetStoreLookup<B, false> = yield select((s: Application.Store) =>
          config.selectBaseStore(s),
        );
        /* Determine what other Account(s) in the store need to have their caches
           invalidated. */
        const accountIds = Object.keys(store.account);
        for (let i = 0; i < accountIds.length; i++) {
          const id = parseInt(accountIds[i]);
          // This should not happen, but just to be sure we should log it.
          if (isNaN(id)) {
            console.error(`Found corrupted Account ID ${accountIds[i]} in indexed store!`);
          } else {
            const accountStore = store.account[id];
            const subs = getSubAccounts(accountStore.table);
            if (subs.length !== 0) {
              yield call(invalidateAccount, ctx, id);
            }
          }
        }
        /* Determine what other SubAccount(s) in the store need to have their
				   caches invalidated. */
        const subaccountIds = Object.keys(store.subaccount);
        for (let i = 0; i < subaccountIds.length; i++) {
          const id = parseInt(subaccountIds[i]);
          // This should not happen, but just to be sure we should log it.
          if (isNaN(id)) {
            console.error(`Found corrupted SubAccount ID ${subaccountIds[i]} in indexed store!`);
          } else {
            const subaccountStore = store.subaccount[id];
            const subs = getSubAccounts(subaccountStore.table);
            if (subs.length !== 0) {
              yield call(invalidateSubAccount, ctx, id);
            }
          }
        }
      }
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* bulkDeleteTask(ctx: TC<B>, ids: number[]): SagaIterator {
    config.table.saving(true);
    try {
      const response: Http.ServiceResponse<typeof api.bulkDeleteFringes> = yield http.request(
        api.bulkDeleteFringes,
        ctx,
        ctx.budgetId,
        { ids },
      );
      yield put(
        config.actions.updateBudgetInState(
          { id: response.parent.id, data: response.parent as B },
          {},
        ),
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true,
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: TC<B>): SagaIterator {
    const response: M = yield http.request(api.createFringe, ctx, ctx.budgetId, {
      previous: e.payload.previous,
      ...tabling.rows.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
    });
    yield put(
      config.actions.handleEvent({ type: "modelsAdded", payload: { model: response } }, ctx),
    );
  }

  function* handleRowPositionChangedEvent(
    e: Table.RowPositionChangedEvent,
    ctx: TC<B>,
  ): SagaIterator {
    const response: M = yield http.request(api.updateFringe, ctx, e.payload.id, {
      previous: e.payload.previous,
    });
    yield put(
      config.actions.handleEvent({ type: "modelsUpdated", payload: { model: response } }, ctx),
    );
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: TC<B>): SagaIterator {
    yield call(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: TC<B>): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(
    e: Table.DataChangeEvent<R, Table.ModelRow<R>>,
    ctx: TC<B>,
  ): SagaIterator {
    const merged = tabling.events.consolidateRowChanges<R, Table.ModelRow<R>>(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, M, P>(
        merged,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, e, requestPayload);
      }
    }
  }

  return {
    handleChangeEvent: tabling.createChangeEventHandler<R, TC<B>>({
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
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
      /*
			It is safe to assume that the ID of the row for which data is being
			changed will always be a ModelRowId - but we have to force coerce that
			here.
			*/
      dataChange: handleDataChangeEvent as Redux.TableChangeEventTask<
        Table.DataChangeEvent<R>,
        R,
        TC<B>
      >,
    }),
  };
};
