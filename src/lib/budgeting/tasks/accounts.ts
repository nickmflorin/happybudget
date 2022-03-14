import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, fork, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { tabling, redux, notifications } from "lib";

type R = Tables.AccountRowData;
type C = Model.Account;
type P = Http.AccountPayload;
type CTX = Redux.WithActionContext<Tables.AccountTableContext>;

export type AuthenticatedAccountsTableActionMap<B extends Model.Template | Model.Budget> =
  Redux.AuthenticatedTableActionMap<R, C, Tables.AccountTableContext> & {
    readonly handleEvent: Redux.TableActionCreator<Table.Event<R, C>, Tables.AccountTableContext>;
    readonly loadingBudget: Redux.ActionCreator<boolean>;
    readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<B>>;
  };

export type PublicAccountsTableTaskConfig = Table.TaskConfig<
  R,
  C,
  Tables.AccountTableStore,
  Tables.AccountTableContext,
  Redux.TableActionMap<C, Tables.AccountTableContext>
>;

export type AuthenticatedAccountsTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  C,
  Tables.AccountTableStore,
  Tables.AccountTableContext,
  AuthenticatedAccountsTableActionMap<B>
>;

export const createPublicTableTaskSet = <B extends Model.Budget | Model.Template>(
  config: PublicAccountsTableTaskConfig | AuthenticatedAccountsTableTaskConfig<B>
): Redux.TableTaskMap<Tables.AccountTableContext> => {
  function* request(action: Redux.TableAction<Redux.TableRequestPayload, Tables.AccountTableContext>): SagaIterator {
    yield put(config.actions.loading(true));
    const effects = [
      api.request(api.getBudgetChildren, action.context, action.context.budgetId),
      api.request(api.getBudgetGroups, action.context, action.context.budgetId),
      api.request(api.getBudgetMarkups, action.context, action.context.budgetId)
    ];
    try {
      const [models, groups, markups]: [
        Http.ListResponse<C>,
        Http.ListResponse<Model.Group>,
        Http.ListResponse<Model.Markup>
      ] = yield all(effects);
      yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups.data }));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.response({ models: [], groups: [], markups: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }
  return { request };
};

export const createAuthenticatedTableTaskSet = <B extends Model.Budget | Model.Template>(
  config: AuthenticatedAccountsTableTaskConfig<B>
): Redux.AuthenticatedTableTaskMap<R, Tables.AccountTableContext> => {
  function* request(action: Redux.TableAction<Redux.TableRequestPayload, Tables.AccountTableContext>): SagaIterator {
    if (redux.typeguards.isListRequestIdsAction(action)) {
      const response: Http.ListResponse<Model.Account> = yield api.request(
        api.getBudgetChildren,
        action.context,
        action.context.budgetId,
        { ids: action.payload.ids }
      );
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: map(response.data, (m: Model.Account) => ({ model: m }))
          },
          action.context
        )
      );
    } else {
      yield put(config.actions.loading(true));
      const effects = [
        api.request(api.getBudgetChildren, action.context, action.context.budgetId),
        api.request(api.getBudgetGroups, action.context, action.context.budgetId),
        api.request(api.getBudgetMarkups, action.context, action.context.budgetId)
      ];
      try {
        const [models, groups, markups]: [
          Http.ListResponse<C>,
          Http.ListResponse<Model.Group>,
          Http.ListResponse<Model.Markup> | undefined
        ] = yield all(effects);
        if (models.data.length === 0) {
          // If there is no table data, we want to default create two rows.
          const response: Http.ServiceResponse<typeof api.bulkCreateBudgetChildren> = yield api.request(
            api.bulkCreateBudgetChildren,
            action.context,
            action.context.budgetId,
            { data: [{}, {}] }
          );
          yield put(
            config.actions.response({ models: response.children, groups: groups.data, markups: markups?.data })
          );
        } else {
          yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups?.data }));
        }
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
            message: action.context.errorMessage || "There was an error retrieving the table data.",
            dispatchClientErrorToSentry: true
          });
        }
        yield put(config.actions.response({ models: [], groups: [], markups: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: CTX) => SagaIterator = tabling.tasks.createBulkTask({
    table: config.table,
    service: api.bulkCreateBudgetChildren,
    selectStore: config.selectStore,
    /*
		Note: We also have access to the updated Account from the response
		(as response.data) so we could use this to update the overall Account
		in state.

		However, the reducer handles that logic pre-request currently, although
		in the future we may want to use the response data as the
		fallback/source of truth.
		*/
    responseActions: (ctx: CTX, r: Http.ParentChildListResponse<Model.BaseBudget, C>, e: Table.RowAddEvent<R>) => [
      config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent as B }),
      config.actions.handleEvent(
        {
          type: "placeholdersActivated",
          payload: { placeholderIds: e.placeholderIds, models: r.children }
        },
        ctx
      )
    ],
    performCreate: (
      ctx: CTX,
      p: Http.BulkCreatePayload<Http.ContactPayload>
    ): [number, Http.BulkCreatePayload<Http.ContactPayload>] => [ctx.budgetId, p]
  });

  function* bulkUpdateTask(
    ctx: CTX,
    requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>,
    isGroupEvent = false
  ): SagaIterator {
    config.table.saving(true);
    if (isGroupEvent !== true) {
      yield put(config.actions.loadingBudget(true));
    }
    try {
      const response: Http.ServiceResponse<typeof api.bulkUpdateBudgetChildren> = yield api.request(
        api.bulkUpdateBudgetChildren,
        ctx,
        ctx.budgetId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: response.parent.id, data: response.parent as B }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the table rows."
      });
    } finally {
      config.table.saving(false);
      if (isGroupEvent !== true) {
        yield put(config.actions.loadingBudget(true));
      }
      try {
        const response: Http.ServiceResponse<typeof api.bulkUpdateBudgetChildren> = yield api.request(
          api.bulkUpdateBudgetChildren,
          ctx,
          ctx.budgetId,
          requestPayload
        );
        yield put(config.actions.updateBudgetInState({ id: response.parent.id, data: response.parent as B }));
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, {
          message: ctx.errorMessage || "There was an error updating the table rows."
        });
      } finally {
        config.table.saving(false);
        if (isGroupEvent !== true) {
          yield put(config.actions.loadingBudget(false));
        }
      }
    }
  }

  function* updateMarkupTask(ctx: CTX, changes: Table.RowChange<R, Table.MarkupRow<R>>[]): SagaIterator {
    if (changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, Table.MarkupRow<R>>) => {
        const payload = tabling.rows.patchPayload<R, C, Http.MarkupPayload>(ch, config.table.getColumns());
        if (!isNil(payload)) {
          return api.request(api.updateMarkup, ctx, tabling.rows.markupId(ch.id), payload);
        }
        return null;
      });
      const validEffects: StrictEffect[] = filter(
        effects,
        (eff: StrictEffect | null) => eff !== null
      ) as StrictEffect[];

      config.table.saving(true);
      try {
        /*
        Note: We will have access to the updated parent and budget for each
				request made to update a specific markup - however, the budget or parent
				will only change when the unit/rate fields are updated for the Markup via
				the Modal (not the table) - so we do not have to be concerned with
				updating the budget or parent in state here.
        */
        yield all(validEffects);
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, {
          message: ctx.errorMessage || "There was an error updating the table rows.",
          dispatchClientErrorToSentry: true
        });
      } finally {
        config.table.saving(false);
      }
    }
  }

  function* deleteGroups(ctx: CTX, ids: number[]): SagaIterator {
    yield all(map(ids, (id: number) => api.request(api.deleteGroup, ctx, id)));
  }

  function* bulkDeleteRows(ctx: CTX, ids: number[], markupIds?: number[]): SagaIterator {
    /* Note: We have do these operations sequentially, since they will both
			 update the Budget in state and we cannot risk running into race
			 conditions. */
    let response: Http.ServiceResponse<typeof api.bulkDeleteBudgetChildren> | null = null;
    if (ids.length !== 0) {
      response = yield api.request(api.bulkDeleteBudgetChildren, ctx, ctx.budgetId, { ids });
    }
    if (!isNil(markupIds) && markupIds.length !== 0) {
      response = yield api.request(api.bulkDeleteBudgetMarkups, ctx, ctx.budgetId, { ids: markupIds });
    }
    if (!isNil(response)) {
      yield put(config.actions.updateBudgetInState({ id: response.parent.id, data: response.parent as B }));
    }
  }

  function* handleRowRemoveFromGroupEvent(e: Table.RowRemoveFromGroupEvent, ctx: CTX): SagaIterator {
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const requestPayload: Http.BulkUpdatePayload<P> = {
      data: map(ids, (id: Table.ModelRowId) => ({
        id,
        group: null
      }))
    };
    yield fork(
      bulkUpdateTask,
      { errorMessage: "There was an error removing the row from the group.", ...ctx },
      requestPayload,
      true
    );
  }

  function* handleAddRowToGroupEvent(e: Table.RowAddToGroupEvent, ctx: CTX): SagaIterator {
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const requestPayload: Http.BulkUpdatePayload<P> = {
      data: map(ids, (id: Table.ModelRowId) => ({
        id,
        group: tabling.rows.groupId(e.payload.group)
      }))
    };
    yield fork(
      bulkUpdateTask,
      { errorMessage: "There was an error adding the row to the group.", ...ctx },
      requestPayload,
      true
    );
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: CTX): SagaIterator {
    yield fork(bulkCreateTask, e, { errorMessage: "There was an error creating the rows", ...ctx });
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: CTX): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (ids.length !== 0) {
      yield put(config.actions.loadingBudget(true));
      config.table.saving(true);

      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];

      const markupRowIds = map(
        filter(ids, (id: Table.RowId) => tabling.rows.isMarkupRowId(id)) as Table.MarkupRowId[],
        (id: Table.MarkupRowId) => tabling.rows.markupId(id)
      ) as number[];

      const groupRowIds = map(
        filter(ids, (id: Table.RowId) => tabling.rows.isGroupRowId(id)) as Table.GroupRowId[],
        (id: Table.GroupRowId) => tabling.rows.groupId(id)
      );

      try {
        yield all([call(deleteGroups, ctx, groupRowIds), call(bulkDeleteRows, ctx, modelRowIds, markupRowIds)]);
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, {
          message: ctx.errorMessage || "There was an error removing the table rows.",
          dispatchClientErrorToSentry: true
        });
      } finally {
        config.table.saving(false);
        yield put(config.actions.loadingBudget(false));
      }
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: C = yield api.request(api.createBudgetChild, ctx, ctx.budgetId, {
        previous: e.payload.previous,
        group: isNil(e.payload.group) ? null : tabling.rows.groupId(e.payload.group),
        ...tabling.rows.postPayload<R, C, P>(e.payload.data, config.table.getColumns())
      });
      /* The Group is not attributed to the Model in a detail response, so
				 if the group did change we have to use the value from the event
				 payload. */
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsAdded",
            payload: {
              model: response,
              group: !isNil(e.payload.group) ? tabling.rows.groupId(e.payload.group) : null
            }
          },
          ctx
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error adding the table rows.",
        dispatchClientErrorToSentry: true
      });
      notifications.requestError(err as Error);
    } finally {
      config.table.saving(false);
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: CTX): SagaIterator {
    config.table.saving(true);
    try {
      const response: C = yield api.request(api.updateAccount, ctx, e.payload.id, {
        previous: e.payload.previous,
        group: isNil(e.payload.newGroup) ? null : tabling.rows.groupId(e.payload.newGroup)
      });
      /* The Group is not attributed to the Model in a detail response, so if
					 the group did change we have to use the value from the event
					 payload. */
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: {
              model: response,
              group: !isNil(e.payload.newGroup) ? tabling.rows.groupId(e.payload.newGroup) : null
            }
          },
          ctx
        )
      );
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error moving the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>, ctx: CTX): SagaIterator {
    const merged = tabling.events.consolidateRowChanges<R>(e.payload);

    const markupChanges: Table.RowChange<R, Table.MarkupRow<R>>[] = filter(merged, (value: Table.RowChange<R>) =>
      tabling.rows.isMarkupRowId(value.id)
    ) as Table.RowChange<R, Table.MarkupRow<R>>[];

    const dataChanges: Table.RowChange<R, Table.ModelRow<R>>[] = filter(merged, (value: Table.RowChange<R>) =>
      tabling.rows.isModelRowId(value.id)
    ) as Table.RowChange<R, Table.ModelRow<R>>[];

    yield fork(updateMarkupTask, ctx, markupChanges);
    if (dataChanges.length !== 0) {
      const requestPayload = tabling.rows.createBulkUpdatePayload<R, C, P>(dataChanges, config.table.getColumns());
      if (requestPayload.data.length !== 0) {
        yield fork(
          bulkUpdateTask,
          {
            errorMessage: "There was an error updating the rows.",
            ...ctx
          },
          requestPayload
        );
      }
    }
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler<R, Tables.AccountTableContext>({
      rowRemoveFromGroup: handleRowRemoveFromGroupEvent,
      rowInsert: handleRowInsertEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowPositionChanged: handleRowPositionChangedEvent
    })
  };
};
