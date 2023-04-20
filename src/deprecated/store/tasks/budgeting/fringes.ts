import { map, filter, intersection, reduce } from "lodash";
import { SagaIterator } from "redux-saga";
import { put, fork, select, call } from "redux-saga/effects";
import { createSelector } from "reselect";

import { logger } from "internal";
import { tabling, model } from "lib";

import * as api from "../../../../application/api";
import * as types from "../../../../application/store/types";
import { createBulkCreateTask, createChangeEventHandler } from "../tabling";

type R = model.FringeRow;
type M = model.Fringe;
type P = api.FringePayload;

type TableContext<B extends model.UserBudget | model.Template> = types.FringesTableActionContext<
  B,
  model.Account | model.SubAccount,
  false
>;

type FringesTableActionCreatorMap<B extends model.Template | model.UserBudget> =
  types.ActionCreatorMap<
    Omit<types.AuthenticatedTableActionPayloadMap<R, M>, "invalidate">,
    TableContext<B>
  > & {
    readonly requestParent: (
      id: number,
      parentType: "account" | "subaccount",
      payload: types.RequestActionPayload,
      ctx: Omit<TableContext<B>, "parentType" | "parentId">,
    ) => types.Action<
      types.RequestActionPayload,
      types.AccountActionContext<B, false> | types.SubAccountActionContext<B, false>
    >;
    readonly requestParentTableData: (
      id: number,
      parentType: "account" | "subaccount",
      payload: types.TableRequestActionPayload,
      ctx: Omit<TableContext<B>, "parentType" | "parentId">,
    ) => types.Action<
      types.TableRequestActionPayload,
      types.SubAccountsTableActionContext<B, model.Account | model.SubAccount, false>
    >;
    readonly updateBudgetInState: types.ActionCreator<types.UpdateModelPayload<B>>;
    readonly invalidate: {
      readonly account: types.ActionCreator<null, types.AccountActionContext<B, false>>;
      readonly subaccount: types.ActionCreator<null, types.SubAccountActionContext<B, false>>;
      readonly accountSubAccountsTable: types.ActionCreator<
        null,
        types.SubAccountsTableActionContext<B, model.Account, false>
      >;
      readonly subaccountSubAccountsTable: types.ActionCreator<
        null,
        types.SubAccountsTableActionContext<B, model.SubAccount, false>
      >;
    };
  };

export type FringesTableTaskConfig<B extends model.Template | model.UserBudget> = Omit<
  types.TableTaskConfig<
    R,
    M,
    types.FringeTableStore,
    TableContext<B>,
    Omit<types.AuthenticatedTableActionPayloadMap<R, M>, "invalidate">,
    FringesTableActionCreatorMap<B>
  >,
  "selectStore"
> & {
  readonly parentDomain: B["domain"];
  readonly selectBaseStore: (state: types.ApplicationStore) => types.BudgetStoreLookup<B, false>;
  readonly selectParentTableStore: (
    state: types.ApplicationStore,
    ctx: TableContext<B>,
  ) => types.SubAccountTableStore;
};

export const createFringesTableTaskSet = <B extends model.Template | model.UserBudget>(
  config: FringesTableTaskConfig<B>,
): Omit<types.AuthenticatedTableTaskMap<R, TableContext<B>>, "request"> => {
  const selectTableStore = createSelector(
    config.selectBaseStore,
    (tableStore: types.BudgetStoreLookup<B, false>) => tableStore.fringes,
  );

  function* invalidateAccount(ctx: TableContext<B>, id: number): SagaIterator {
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

  function* invalidateSubAccount(ctx: TableContext<B>, id: number): SagaIterator {
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

  const bulkCreateTask: (e: tabling.RowAddEvent<R>, ctx: TableContext<B>) => SagaIterator =
    createBulkCreateTask({
      table: config.table,
      selectStore: selectTableStore,
      responseActions: (
        ctx: TableContext<B>,
        r: api.ParentChildListResponse<B, M>,
        e: tabling.RowAddEvent<R>,
      ) => [
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.payload.placeholderIds, models: r.children },
          },
          ctx,
        ),
        config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent }, {}),
      ],
      performCreate:
        (ctx: TableContext<B>, p: api.BulkCreatePayload<api.FringePayload>) =>
        async (): Promise<api.ClientResponse<api.ParentChildListResponse<B, M>>> => {
          /* The fringes task set can be used in the context of a Template or a UserBudget, which is
             determined by the `parentDomain` argument provided to the task factory (and the generic
             type parameter B).  The API endpoint will return the data for a Template if the
             budgetId in the context corresponds to a Template, or it will return the data for a
             UserBudget if the budgetId in the context corresponds to a Budget.  However, we still
             need to ensure that this is the case when processing the API response.

             This behavior is related to the polymorphism of the budget/template endpoints, which
             will likely be refactored in the future to have a clearer distinction between the
             template and budget domains. */
          const { response, error, ...others } = await api.bulkCreateFringes(
            { id: ctx.budgetId },
            { body: p },
          );
          if (error) {
            return { response, error } as api.ClientResponse<
              api.ParentChildListResponse<B, model.Fringe>
            >;
          }
          const data = model.parseBudgetOfDomain<B>(response.parent, config.parentDomain);
          return { ...others, response: { ...response, parent: data }, error };
        },
    });

  const getSubAccountsWithFringes = (
    s: types.SubAccountTableStore,
    fringeIds: number[],
  ): tabling.RowSubType<model.SubAccountRow, "model">[] =>
    (
      s.data.filter((r: model.SubAccountRow) =>
        tabling.isRowOfType(r, "model"),
      ) as tabling.RowSubType<model.SubAccountRow, "model">[]
    ).filter(
      (r: tabling.RowSubType<model.SubAccountRow, "model">) =>
        intersection(r.data.fringes, fringeIds).length !== 0,
    );

  function* bulkUpdateTask(
    ctx: TableContext<B>,
    e: tabling.ChangeEvent<"dataChange", R>,
    requestPayload: api.BulkUpdatePayload<P>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkUpdateFringes>> = yield call(
      api.bulkUpdateFringes,
      { id: ctx.budgetId },
      { body: requestPayload },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      const parent = model.parseBudgetOfDomain<B>(r.response.parent, config.parentDomain);
      yield put(config.actions.updateBudgetInState({ id: parent.id, data: parent }, {}));

      const FRINGE_QUANTITATIVE_FIELDS: (keyof api.FringePayload)[] = ["cutoff", "rate", "unit"];

      const payloadWarrantsRecalculation = (p: api.ModelBulkUpdatePayload<api.FringePayload>) =>
        filter(
          map(FRINGE_QUANTITATIVE_FIELDS, (field: keyof api.FringePayload) => p[field]),
          (v: api.FringePayload[keyof api.FringePayload]) => v !== undefined,
        ).length !== 0;
      /* If any changes to the Fringe(s) affect calculations of SubAccount(s) that are associated
         with those Fringe(s), then the SubAccount(s) need to be updated such that their values
         reflect the changes to the relevant Fringe(s).

         For the active SubAccount(s) table being shown (where that SubAccount(s) table can either
         be the SubAccount(s) belonging to an Account or another SubAccount), we need to submit a
         request to refresh the table data with the fresh SubAccount(s) from the API that have been
         recalculated. Additionally, we need to submit a request to update the parent Account or
         SubAccount that the refreshed SubAccount(s) in the table belong to.

         However, this does not just affect the SubAccount(s) or parent Account/SubAccount that are
         currently being displayed - but will potentially affect SubAccount(s) in tables already
         cached in the store or parent Account/SubAccount(s) that are also already cached in the
         store.

         To fix this, we must invalidate those objects such that when the user revisits the page
         showing a table with the affected SubAccount(s) or parent Account/SubAccount, the tasks
         will not used the cached results but instead request fresh results from the API. */

      /* Determine the IDs of the Fringe(s) that were changed in a manner which causes the related
         SubAccount(s) to need recalculation. */
      const fringeIds = reduce(
        requestPayload.data,
        (curr: number[], p: api.ModelBulkUpdatePayload<api.FringePayload>) =>
          payloadWarrantsRecalculation(p) ? [...curr, p.id] : curr,
        [],
      );

      if (fringeIds.length !== 0) {
        const subaccounts: types.SubAccountTableStore = yield select((s: types.ApplicationStore) =>
          config.selectParentTableStore(s, ctx),
        );
        // Determine what SubAccount(s) are related to the changed Fringe(s).
        const subaccountsWithFringesThatChanged = getSubAccountsWithFringes(subaccounts, fringeIds);

        /* Request fresh table data and parent data for the table and parent currently being
           viewed. */
        if (subaccountsWithFringesThatChanged.length !== 0) {
          yield put(
            config.actions.requestParentTableData(
              ctx.parentId,
              ctx.parentType,
              {
                ids: subaccountsWithFringesThatChanged.map(
                  (r: tabling.RowSubType<model.SubAccountRow, "model">) => r.id,
                ),
              },
              ctx,
            ),
          );
          yield put(
            config.actions.requestParent(ctx.parentId, ctx.parentType, { force: true }, ctx),
          );
        }
        const store: types.BudgetStoreLookup<B, false> = yield select((s: types.ApplicationStore) =>
          config.selectBaseStore(s),
        );
        // Determine what other Account(s) in the store need to have their caches invalidated.
        const accountIds = Object.keys(store.account);
        for (let i = 0; i < accountIds.length; i++) {
          const id = parseInt(accountIds[i]);
          // This should not happen, but just to be sure we should log it.
          if (isNaN(id)) {
            logger.error(`Found corrupted Account ID ${accountIds[i]} in indexed store!`);
          } else {
            const accountStore = store.account[id];
            const subs = getSubAccountsWithFringes(accountStore.table, fringeIds);
            if (subs.length !== 0) {
              yield call(invalidateAccount, ctx, id);
            }
          }
        }
        // Determine what other SubAccount(s) in the store need to have their caches invalidated.
        const subaccountIds = Object.keys(store.subaccount);
        for (let i = 0; i < subaccountIds.length; i++) {
          const id = parseInt(subaccountIds[i]);
          // This should not happen, but just to be sure we should log it.
          if (isNaN(id)) {
            logger.error(`Found corrupted SubAccount ID ${subaccountIds[i]} in indexed store!`);
          } else {
            const subaccountStore = store.subaccount[id];
            const subs = getSubAccountsWithFringes(subaccountStore.table, fringeIds);
            if (subs.length !== 0) {
              yield call(invalidateSubAccount, ctx, id);
            }
          }
        }
      }
    }
    config.table.saving(false);
  }

  function* bulkDeleteTask(ctx: TableContext<B>, ids: number[]): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.bulkDeleteFringes>> = yield call(
      api.bulkDeleteFringes,
      { id: ctx.budgetId },
      { body: { ids } },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error deleting the rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      /* The fringes task set can be used in the context of a Template or a UserBudget, which is
         determined by the `parentDomain` argument provided to the task factory (and the generic
         type parameter B).  The API endpoint will return the data for a Template if the budgetId
         in the context corresponds to a Template, or it will return the data for a UserBudget if
         the budgetId in the context corresponds to a Budget.  However, we still need to ensure
         that this is the case when processing the API response.

         This behavior is related to the polymorphism of the budget/template endpoints, which
         will likely be refactored in the future to have a clearer distinction between the
         template and budget domains. */
      const data = model.parseBudgetOfDomain<B>(r.response.parent, config.parentDomain);
      yield put(config.actions.updateBudgetInState({ id: r.response.parent.id, data }, {}));
    }
    config.table.saving(false);
  }

  function* handleRowInsertEvent(
    e: tabling.ChangeEvent<"rowInsert", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createFringe>> = yield call(
      api.createFringe,
      { id: ctx.budgetId },
      {
        body: {
          previous: e.payload.previous,
          ...tabling.postPayload<R, M, P>(e.payload.data, config.table.getColumns()),
        },
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsAdded",
            payload: { model: r.response },
          },
          ctx,
        ),
      );
    }
    config.table.saving(false);
  }

  function* handleRowPositionChangedEvent(
    e: tabling.ChangeEvent<"rowPositionChanged", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.updateFringe>> = yield call(
      api.updateFringe,
      { id: e.payload.id },
      { body: { previous: e.payload.previous } },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: { model: r.response },
          },
          ctx,
        ),
      );
    }
    config.table.saving(false);
  }

  function* handleRowAddEvent(e: tabling.RowAddEvent<R>, ctx: TableContext<B>): SagaIterator {
    yield call(bulkCreateTask, e, ctx);
  }

  function* handleRowDeleteEvent(
    e: tabling.ChangeEvent<"rowDelete", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    const ids: tabling.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const modelRowIds = filter(ids, (id: tabling.RowId) => tabling.isModelRowId(id)) as number[];
    if (modelRowIds.length !== 0) {
      yield fork(bulkDeleteTask, ctx, modelRowIds);
    }
  }

  function* handleDataChangeEvent(
    e: tabling.ChangeEvent<"dataChange", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    const merged = tabling.consolidateRowChanges<R>(e.payload);
    if (merged.length !== 0) {
      const requestPayload = tabling.createBulkUpdatePayload<R, M, P>(
        merged,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield fork(bulkUpdateTask, ctx, e, requestPayload);
      }
    }
  }

  return {
    handleChangeEvent: createChangeEventHandler<R, TableContext<B>>({
      rowAddData: handleRowAddEvent,
      rowAddIndex: handleRowAddEvent,
      rowAddCount: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      rowInsert: handleRowInsertEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
      dataChange: handleDataChangeEvent,
    }),
  };
};
