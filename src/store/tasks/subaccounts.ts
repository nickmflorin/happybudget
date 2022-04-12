import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, fork, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { tabling, notifications, redux, http } from "lib";
import { createTaskSet } from "./contacts";

type R = Tables.SubAccountRowData;
type C = Model.SubAccount;
type P = Http.SubAccountPayload;
type CTX = Redux.WithActionContext<Tables.SubAccountTableContext>;

export type PublicSubAccountsTableServiceSet = {
  readonly request: Http.DetailListService<C>;
  readonly requestGroups: Http.DetailListService<Model.Group>;
  readonly requestMarkups: Http.DetailListService<Model.Markup>;
};

export type AuthenticatedSubAccountsTableServiceSet<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = PublicSubAccountsTableServiceSet & {
  readonly create: Http.DetailPostService<C, P>;
  readonly createGroup: Http.DetailPostService<Model.Group, Http.GroupPayload>;
  readonly createMarkup: Http.DetailPostService<Http.AncestryResponse<B, M, Model.Markup>, Http.MarkupPayload>;
  readonly bulkDelete: Http.TreeBulkDeleteService<B, M>;
  readonly bulkDeleteMarkups: Http.TreeBulkDeleteService<B, M>;
  readonly bulkUpdate: Http.TreeBulkUpdateService<B, M, C, P>;
  readonly bulkCreate: Http.TreeBulkCreateService<B, M, C, P>;
};

export type PublicSubAccountsTableActionMap = Redux.TableActionMap<C, Tables.SubAccountTableContext> & {
  readonly responseSubAccountUnits: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
  readonly responseFringes: Redux.ActionCreator<Http.TableResponse<Model.Fringe>>;
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export type AuthenticatedSubAccountsTableActionMap<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = Redux.AuthenticatedTableActionMap<R, C, Tables.SubAccountTableContext> & {
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<B>>;
  readonly updateParentInState: Redux.ActionCreator<Redux.UpdateModelPayload<M>>;
  readonly responseSubAccountUnits: Redux.ActionCreator<Http.ListResponse<Model.Tag>>;
  readonly responseFringes: Redux.ActionCreator<Http.TableResponse<Model.Fringe>>;
  readonly responseFringeColors: Redux.ActionCreator<Http.ListResponse<string>>;
};

export type PublicSubAccountsTableTaskConfig = Table.TaskConfig<
  R,
  C,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext,
  PublicSubAccountsTableActionMap
> & {
  readonly services: PublicSubAccountsTableServiceSet;
};

export type AuthenticatedSubAccountsTableTaskConfig<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = Table.TaskConfig<
  R,
  C,
  Tables.SubAccountTableStore,
  Tables.SubAccountTableContext,
  AuthenticatedSubAccountsTableActionMap<M, B>
> & {
  readonly services: AuthenticatedSubAccountsTableServiceSet<M, B>;
};

export const createPublicTableTaskSet = (
  config: PublicSubAccountsTableTaskConfig
): Redux.TableTaskMap<Tables.SubAccountTableContext> => {
  function* requestFringes(ctx: CTX): SagaIterator {
    try {
      const response: Http.ListResponse<Model.Fringe> = yield http.request(api.getFringes, ctx, ctx.budgetId);
      yield put(config.actions.responseFringes({ models: response.data }));
    } catch (e: unknown) {
      /* TODO: It would be nice if we can show this in the Fringes table
         instead (if it is open). */
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseFringes({ models: [] }));
    }
  }

  function* requestFringesColors(ctx: CTX): SagaIterator {
    try {
      const response = yield http.request(api.getFringeColors, ctx);
      yield put(config.actions.responseFringeColors(response));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseFringeColors({ data: [], count: 0 }));
    }
  }

  function* requestSubAccountUnits(ctx: CTX): SagaIterator {
    try {
      const response = yield http.request(api.getSubAccountUnits, ctx);
      yield put(config.actions.responseSubAccountUnits(response));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseSubAccountUnits({ data: [], count: 0 }));
    }
  }

  function* request(action: Redux.TableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>): SagaIterator {
    yield put(config.actions.loading(true));
    const effects = [
      http.request(config.services.request, action.context, action.context.id),
      http.request(config.services.requestGroups, action.context, action.context.id),
      http.request(config.services.requestMarkups, action.context, action.context.id)
    ];
    try {
      yield fork(requestSubAccountUnits, action.context);
      yield fork(requestFringes, action.context);
      yield fork(requestFringesColors, action.context);
      const [models, groups, markups]: [
        Http.ListResponse<C>,
        Http.ListResponse<Model.Group>,
        Http.ListResponse<Model.Markup>
      ] = yield all(effects);
      yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups.data }));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: action.context.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.response({ models: [], markups: [], groups: [] }));
    } finally {
      yield put(config.actions.loading(false));
    }
  }
  return { request };
};

export const createAuthenticatedTableTaskSet = <
  M extends Model.Account | Model.SubAccount,
  B extends Model.Budget | Model.Template
>(
  config: AuthenticatedSubAccountsTableTaskConfig<M, B>
): Redux.AuthenticatedTableTaskMap<R, Tables.SubAccountTableContext> => {
  const contactsTasks = createTaskSet();

  function* requestFringes(ctx: CTX): SagaIterator {
    try {
      const response: Http.ListResponse<Model.Fringe> = yield http.request(api.getFringes, ctx, ctx.budgetId);
      if (response.data.length === 0) {
        // If there is no table data, we want to default create two rows.
        try {
          const bulkCreateResponse: Http.ServiceResponse<typeof api.bulkCreateFringes> = yield http.request(
            api.bulkCreateFringes,
            ctx,
            ctx.budgetId,
            { data: [{}, {}] }
          );
          yield put(config.actions.responseFringes({ models: bulkCreateResponse.children }));
          yield put(config.actions.updateBudgetInState({ id: ctx.budgetId, data: bulkCreateResponse.parent as B }));
        } catch (e: unknown) {
          /* TODO: It would be nice if we can show this in the Fringes table
             instead (if it is open). */
          config.table.handleRequestError(e as Error, {
            message: ctx.errorMessage || "There was an error retrieving the fringes table data.",
            dispatchClientErrorToSentry: true
          });
        }
      } else {
        yield put(config.actions.responseFringes({ models: response.data }));
      }
    } catch (e: unknown) {
      /* TODO: It would be nice if we can show this in the Fringes table
         instead (if it is open). */
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the fringes table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseFringes({ models: [] }));
    }
  }

  function* requestFringesColors(ctx: CTX): SagaIterator {
    try {
      const response = yield http.request(api.getFringeColors, ctx, {});
      yield put(config.actions.responseFringeColors(response));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseFringeColors({ data: [], count: 0 }));
    }
  }

  function* requestSubAccountUnits(ctx: CTX): SagaIterator {
    try {
      const response = yield http.request(api.getSubAccountUnits, ctx);
      yield put(config.actions.responseSubAccountUnits(response));
    } catch (e: unknown) {
      config.table.handleRequestError(e as Error, {
        message: ctx.errorMessage || "There was an error retrieving the table data.",
        dispatchClientErrorToSentry: true
      });
      yield put(config.actions.responseSubAccountUnits({ data: [], count: 0 }));
    }
  }

  function* request(action: Redux.TableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>): SagaIterator {
    if (redux.isListRequestIdsAction(action)) {
      const response: Http.ListResponse<Model.SubAccount> = yield http.request(
        config.services.request,
        action.context,
        action.context.id,
        { ids: action.payload.ids }
      );
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsUpdated",
            payload: map(response.data, (m: Model.SubAccount) => ({ model: m }))
          },
          action.context
        )
      );
    } else {
      yield put(config.actions.loading(true));
      const effects = [
        http.request(config.services.request, action.context, action.context.id),
        http.request(config.services.requestGroups, action.context, action.context.id),
        http.request(config.services.requestMarkups, action.context, action.context.id)
      ];
      try {
        yield fork(contactsTasks.request, action as Redux.Action);
        yield fork(requestSubAccountUnits, action.context);
        yield fork(requestFringes, action.context);
        yield fork(requestFringesColors, action.context);
        const [models, groups, markups]: [
          Http.ListResponse<C>,
          Http.ListResponse<Model.Group>,
          Http.ListResponse<Model.Markup>
        ] = yield all(effects);
        if (models.data.length === 0) {
          // If there is no table data, we want to default create two rows.
          try {
            const response: Http.ServiceResponse<typeof config.services.bulkCreate> = yield http.request(
              config.services.bulkCreate,
              action.context,
              action.context.id,
              { data: [{}, {}] }
            );
            yield put(
              config.actions.response({ models: response.children, groups: groups.data, markups: markups.data })
            );
          } catch (e: unknown) {
            config.table.handleRequestError(e as Error, {
              message: action.context.errorMessage || "There was an error retrieving the table data.",
              dispatchClientErrorToSentry: true
            });
          }
        } else {
          yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups.data }));
        }
      } catch (e: unknown) {
        const err = e as Error;
        if (err instanceof api.PermissionError && err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR) {
          notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
        } else {
          config.table.handleRequestError(e as Error, {
            message: action.context.errorMessage || "There was an error retrieving the table data.",
            dispatchClientErrorToSentry: true
          });
        }
        yield put(config.actions.response({ models: [], markups: [], groups: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: CTX) => SagaIterator = tabling.tasks.createBulkTask({
    table: config.table,
    service: config.services.bulkCreate,
    selectStore: config.selectStore,
    responseActions: (ctx: CTX, r: Http.AncestryListResponse<B, M, C>, e: Table.RowAddEvent<R>) => [
      config.actions.updateBudgetInState({ id: r.budget.id, data: r.budget }),
      config.actions.updateParentInState({ id: r.parent.id, data: r.parent }),
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
      p: Http.BulkCreatePayload<Http.SubAccountPayload>
    ): [number, Http.BulkCreatePayload<Http.SubAccountPayload>] => [ctx.id, p]
  });

  function* bulkUpdateTask(ctx: CTX, requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>): SagaIterator {
    config.table.saving(true);
    try {
      const response: Http.ServiceResponse<typeof config.services.bulkUpdate> = yield http.request(
        config.services.bulkUpdate,
        ctx,
        ctx.id,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
      yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* updateMarkupTask(ctx: CTX, changes: Table.RowChange<R, Table.MarkupRow<R>>[]): SagaIterator {
    if (changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, Table.MarkupRow<R>>) => {
        const payload = tabling.rows.patchPayload<R, C, Http.MarkupPayload>(ch, config.table.getColumns());
        if (!isNil(payload)) {
          return http.request(api.updateMarkup, ctx, tabling.rows.markupId(ch.id), payload);
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
				will only change when the unit/rate fields are updated for the Markup
				via the Modal (not the table) - so we do not have to be concerned
        with updating the budget or parent in state here.
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
    yield all(map(ids, (id: number) => http.request(api.deleteGroup, ctx, id)));
  }

  function* bulkDeleteRows(ctx: CTX, ids: number[], markupIds?: number[]): SagaIterator {
    /* Note: We have do these operations sequentially, since they will both
			 update the Budget in state and we cannot risk running into race
			 conditions. */
    let response: Http.ServiceResponse<typeof config.services.bulkDelete> | null = null;
    if (ids.length !== 0) {
      response = yield http.request(config.services.bulkDelete, ctx, ctx.id, { ids });
    }
    if (!isNil(markupIds) && markupIds.length !== 0 && !isNil(config.services.bulkDeleteMarkups)) {
      response = yield http.request(config.services.bulkDeleteMarkups, ctx, ctx.id, { ids: markupIds });
    }
    if (!isNil(response)) {
      yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }));
      yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
    }
  }

  function* handleRemoveRowFromGroupEvent(e: Table.RowRemoveFromGroupEvent, ctx: CTX): SagaIterator {
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
      requestPayload
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
      requestPayload
    );
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, ctx: CTX): SagaIterator {
    const response: C = yield http.request(config.services.create, ctx, ctx.id, {
      previous: e.payload.previous,
      group: isNil(e.payload.group) ? null : tabling.rows.groupId(e.payload.group),
      ...tabling.rows.postPayload<R, C, P>(e.payload.data, config.table.getColumns())
    });
    /* The Group is not attributed to the Model in a detail response, so if the
		   group did change we have to use the value from the event payload. */
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
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent, ctx: CTX): SagaIterator {
    const response: C = yield http.request(api.updateSubAccount, ctx, e.payload.id, {
      previous: e.payload.previous,
      group: isNil(e.payload.newGroup) ? null : tabling.rows.groupId(e.payload.newGroup)
    });
    /* The Group is not attributed to the Model in a detail response, so if the
		   group did change we have to use the value from the event payload. */
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
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: CTX): SagaIterator {
    if (!isNil(bulkCreateTask)) {
      yield call(bulkCreateTask, e, ctx);
    }
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, ctx: CTX): SagaIterator {
    const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (ids.length !== 0) {
      config.table.saving(true);

      const modelRowIds = filter(ids, (id: Table.RowId) => tabling.rows.isModelRowId(id)) as number[];

      const markupRowIds = map(
        filter(ids, (id: Table.RowId) => tabling.rows.isMarkupRowId(id)) as Table.MarkupRowId[],
        (id: Table.MarkupRowId) => tabling.rows.markupId(id)
      );

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
      }
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
        yield call(bulkUpdateTask, ctx, requestPayload);
      }
    }
  }

  function* handleGroupAddEvent(e: Table.GroupAddEvent, ctx: CTX): SagaIterator {
    const response: Model.Group = yield http.request(config.services.createGroup, ctx, ctx.id, e.payload);
    yield put(config.actions.handleEvent({ type: "modelsAdded", payload: response }, ctx));
    e.onSuccess?.(response);
  }

  function* handleMarkupAddEvent(e: Table.MarkupAddEvent, ctx: CTX): SagaIterator {
    const response: Http.AncestryResponse<B, M, Model.Markup> = yield http.request(
      config.services.createMarkup,
      ctx,
      ctx.id,
      e.payload
    );
    yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
    yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }));
    yield put(config.actions.handleEvent({ type: "modelsAdded", payload: response.data }, ctx));
    e.onSuccess?.(response);
  }

  function* handleMarkupUpdateEvent(e: Table.MarkupUpdateEvent, ctx: CTX): SagaIterator {
    const response: Http.AncestryResponse<B, M, Model.Markup> = yield http.request(
      api.updateMarkup,
      ctx,
      e.payload.id,
      e.payload.data
    );
    yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
    yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }));
    yield put(config.actions.handleEvent({ type: "modelsUpdated", payload: response.data }, ctx));
    e.onSuccess?.(response);
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler<R, Tables.SubAccountTableContext>({
      rowRemoveFromGroup: handleRemoveRowFromGroupEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowAdd: handleRowAddEvent,
      rowInsert: tabling.tasks.task(handleRowInsertEvent, config.table, "There was an error adding the table rows."),
      groupAdd: tabling.tasks.task(handleGroupAddEvent, config.table, "There was an error creating the group."),
      markupAdd: tabling.tasks.task(handleMarkupAddEvent, config.table, "There was an error creating the markup."),
      markupUpdate: tabling.tasks.task(
        handleMarkupUpdateEvent,
        config.table,
        "There was an error updating the markup."
      ),
      rowPositionChanged: tabling.tasks.task(
        handleRowPositionChangedEvent,
        config.table,
        "There was an error moving the table rows."
      )
    })
  };
};
