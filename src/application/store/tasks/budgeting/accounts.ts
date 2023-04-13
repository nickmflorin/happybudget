import { SagaIterator } from "redux-saga";
import { CallEffect, StrictEffect, call, put, fork, all, select } from "redux-saga/effects";

import { errors } from "application";
import { logger } from "internal";
import { tabling, notifications, model } from "lib";

import * as api from "../../../api";
import * as types from "../../types";
import * as cache from "../cache";
import { createBulkCreateTask, createChangeEventHandler } from "../tabling";

type R = model.AccountRow;
type C = model.Account;
type P = api.AccountPayload;
type S = types.AccountTableStore;

type TableContext<B extends model.Budget | model.Template = model.Budget | model.Template> =
  B extends model.UserBudget | model.Template
    ? types.AccountsTableActionContext<B, false>
    : B extends model.AnotherUserBudget
    ? types.AccountsTableActionContext<B, true>
    : never;

type PublicAccountsTableTaskConfig<
  B extends model.Template | model.Budget = model.AnotherUserBudget,
  CTX extends TableContext = TableContext<B>,
> = {
  readonly parentDomain: "budget";
  readonly public: true;
  readonly actions: Omit<types.ActionCreatorMap<types.TableActionPayloadMap<C>, CTX>, "invalidate">;
  readonly table: tabling.TableInstance<R, C>;
  readonly selectStore: (state: types.ApplicationStore, ctx: CTX) => S;
};

type AuthenticatedAccountsTableActionMap<
  B extends model.Template | model.Budget = model.UserBudget | model.Template,
  CTX extends TableContext = TableContext<B>,
> = Omit<
  types.ActionCreatorMap<types.AuthenticatedTableActionPayloadMap<R, C>, CTX>,
  "invalidate"
> & {
  readonly handleEvent: types.ActionCreator<tabling.AnyTableEvent<R, C>, CTX>;
  readonly updateBudgetInState: types.ActionCreator<types.UpdateModelPayload<B>>;
};

type AuthenticatedAccountsTableTaskConfig<
  B extends model.Template | model.Budget,
  CTX extends TableContext = TableContext<B>,
> = {
  readonly parentDomain: B["domain"];
  readonly public: false;
  readonly actions: AuthenticatedAccountsTableActionMap<B, CTX>;
  readonly table: tabling.TableInstance<R, C>;
  readonly selectStore: (state: types.ApplicationStore, ctx: CTX) => S;
};

const getRequestEffects = <
  B extends model.Template | model.Budget,
  CTX extends TableContext = TableContext<B>,
>(
  action: types.Action<types.TableRequestActionPayload, CTX>,
): [
  CallEffect<Awaited<ReturnType<typeof api.getBudgetChildren>>>,
  CallEffect<Awaited<ReturnType<typeof api.getBudgetGroups>>>,
  CallEffect<Awaited<ReturnType<typeof api.getBudgetMarkups>>>,
] => [
  call(api.getBudgetChildren, { id: action.context.budgetId }),
  call(api.getBudgetGroups, { id: action.context.budgetId }),
  call(api.getBudgetMarkups, { id: action.context.budgetId }),
];

type RequestTableData<
  B extends model.Budget | model.Template,
  CTX extends TableContext<B> = TableContext<B>,
> = {
  (
    action: types.Action<types.TableRequestActionPayload, CTX>,
    config: AuthenticatedAccountsTableTaskConfig<B, CTX> | PublicAccountsTableTaskConfig<B, CTX>,
    options: {
      onResponse: (r: types.SuccessfulTableResponse<model.Account>) => SagaIterator;
      onError: (errors: [errors.HttpError, ...errors.HttpError[]]) => void;
    },
  ): SagaIterator;
};

function* requestTableData<
  B extends model.Budget | model.Template,
  CTX extends TableContext<B> = TableContext<B>,
>(
  action: types.Action<types.TableRequestActionPayload, CTX>,
  config: AuthenticatedAccountsTableTaskConfig<B, CTX> | PublicAccountsTableTaskConfig<B, CTX>,
  options: {
    onResponse: (r: types.SuccessfulTableResponse<model.Account>) => SagaIterator;
    onError: (errors: [errors.HttpError, ...errors.HttpError[]]) => void;
  },
): SagaIterator {
  yield put(config.actions.loading(true, action.context));
  const effects = getRequestEffects<B, CTX>(action);

  const [modelsR, groupsR, markupsR]: [
    Awaited<ReturnType<typeof api.getBudgetChildren>>,
    Awaited<ReturnType<typeof api.getBudgetGroups>>,
    Awaited<ReturnType<typeof api.getBudgetMarkups>>,
  ] = yield all(effects);

  const errors = [modelsR.error, groupsR.error, markupsR.error].filter(
    (e: errors.HttpError | undefined) => e !== undefined,
  ) as errors.HttpError[];
  if (errors.length > 0) {
    /* This logging might be redundant, but the error handling around the table 'handleRequestError'
       method is going to be refactored soon. */
    errors.forEach((e: errors.HttpError) => {
      logger.error(
        { error: e, budgetId: action.context.budgetId },
        "There was an error retrieving the table data for the budget.",
      );
    });
    options.onError(errors as [errors.HttpError, ...errors.HttpError[]]);
    yield put(config.actions.response({ error: errors[0] }, action.context));
  } else {
    const [models, groups, markups] = [modelsR.response, groupsR.response, markupsR.response] as [
      api.ApiListResponse<model.Account>,
      api.ApiListResponse<model.Group>,
      api.ApiListResponse<model.Markup>,
    ];
    yield call(options.onResponse, {
      models: models.data,
      groups: groups.data,
      markups: markups.data,
    });
  }
  yield put(config.actions.loading(false, action.context));
}

export const createPublicAccountsTableTaskSet = (
  config: PublicAccountsTableTaskConfig,
): types.TableTaskMap<TableContext<model.AnotherUserBudget>> => {
  function* request(
    action: types.Action<types.TableRequestActionPayload, TableContext<model.AnotherUserBudget>>,
  ): SagaIterator {
    // Only perform the request if the data is not already in the store.
    const canUseCachedResponse = yield select((s: types.ApplicationStore) =>
      cache.canUseCachedListResponse(config.selectStore(s, action.context)),
    );
    if (!canUseCachedResponse || types.tableRequestActionIsForced(action)) {
      yield call(requestTableData as RequestTableData<model.AnotherUserBudget>, action, config, {
        onResponse: function* (r: types.TableResponse<model.Account>) {
          yield put(config.actions.response(r, action.context));
        },
        onError: errors =>
          config.table.handleRequestError(errors, {
            message: "There was an error retrieving the table data.",
            dispatchClientErrorToSentry: true,
          }),
      });
    }
  }
  return { request };
};

export const createAuthenticatedAccountsTableTaskSet = <
  B extends model.UserBudget | model.Template,
>(
  config: AuthenticatedAccountsTableTaskConfig<B>,
): types.AuthenticatedTableTaskMap<R, TableContext<B>> => {
  function* request(
    action: types.Action<types.TableRequestActionPayload, TableContext<B>>,
  ): SagaIterator {
    if (types.tableRequestActionIsListIds(action)) {
      const r: Awaited<ReturnType<typeof api.getBudgetChildren>> = yield call(
        api.getBudgetChildren,
        { id: action.context.budgetId },
        { query: { ids: action.payload.ids } },
      );
      if (r.error) {
        config.table.handleRequestError(r.error, {
          message: action.context.errorMessage || "There was an error retrieving the table data.",
          dispatchClientErrorToSentry: true,
        });
      } else {
        yield put(
          config.actions.handleEvent(
            {
              type: "modelsUpdated",
              payload: r.response.data.map((m: model.Account) => ({ model: m })),
            },
            action.context,
          ),
        );
      }
    } else {
      // Only perform the request if the data is not already in the store.
      const canUseCachedResponse = yield select((s: types.ApplicationStore) =>
        cache.canUseCachedListResponse(config.selectStore(s, action.context)),
      );
      if (!canUseCachedResponse || types.requestActionIsForced(action)) {
        yield call(requestTableData as RequestTableData<B>, action, config, {
          onResponse: function* (r: types.SuccessfulTableResponse<model.Account>) {
            const newModels: Awaited<ReturnType<typeof api.bulkCreateBudgetChildren>> = yield call(
              api.bulkCreateBudgetChildren,
              { id: action.context.budgetId },
              { body: { data: [{}, {}] as api.AccountPayload[] } },
            );
            if (newModels.error !== undefined) {
              if (
                newModels.error instanceof errors.ApiGlobalError &&
                newModels.error.code === errors.ApiErrorCodes.PRODUCT_PERMISSION_ERROR
              ) {
                notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
              } else {
                /* This log might be redundant because the `handleRequestError` method below should
                   also issue a log - but we will be refactoring that method anyways in the near
                   future. */
                logger.error(
                  { error: newModels.error },
                  "Failed to automatically create two rows for accounts table.  The table will " +
                    "be shown with no prepopulated rows.",
                );
                config.table.handleRequestError(newModels.error, {
                  message:
                    action.context.errorMessage || "There was an error retrieving the table data.",
                  dispatchClientErrorToSentry: true,
                });
              }
              /* We should not dispatch the error in the action here because the error is used for
                 the cache invalidation of the request to fetch the table data, not the request to
                 auto create two rows.  The overall flow here needs to be improved/fixed, which will
                 hopefully be addressed soon. */
              yield put(
                config.actions.response({ models: [], markups: r.markups, groups: r.groups }, {
                  budgetId: action.context.budgetId,
                } as TableContext<B>),
              );
            } else {
              const budget = model.parseBudgetOfDomain<B>(
                newModels.response.parent,
                config.parentDomain,
              );
              yield put(config.actions.updateBudgetInState({ id: budget.id, data: budget }, {}));
              yield put(
                config.actions.response(
                  { models: newModels.response.children, markups: r.markups, groups: r.groups },
                  { budgetId: action.context.budgetId } as TableContext<B>,
                ),
              );
            }
            yield put(config.actions.response(r, action.context));
          },
          onError: errs => {
            const subscriptionErrors = errs.filter(
              (e: errors.HttpError) =>
                e instanceof errors.ApiGlobalError &&
                e.code === errors.ApiErrorCodes.PRODUCT_PERMISSION_ERROR,
            );
            const nonSubscriptionErrors = errs.filter(
              (e: errors.HttpError) =>
                !(
                  e instanceof errors.ApiGlobalError &&
                  e.code === errors.ApiErrorCodes.PRODUCT_PERMISSION_ERROR
                ),
            );
            if (subscriptionErrors.length > 0) {
              notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
            }
            if (nonSubscriptionErrors.length > 0) {
              config.table.handleRequestError(nonSubscriptionErrors, {
                message:
                  action.context.errorMessage || "There was an error retrieving the table data.",
                dispatchClientErrorToSentry: true,
              });
            }
          },
        });
      }
    }
  }

  const bulkCreateTask: (e: tabling.RowAddEvent<R>, ctx: TableContext<B>) => SagaIterator =
    createBulkCreateTask({
      table: config.table,
      selectStore: config.selectStore,
      /* Note: We also have access to the updated Account from the response (as response.data) so we
         could use this to update the overall Account in state. However, the reducer handles that
         logic pre-request currently, although in the future we may want to use the response data as
         the fallback and/or source of truth. */
      responseActions: (
        ctx: TableContext<B>,
        r: api.ParentChildListResponse<B, C>,
        e: tabling.RowAddEvent<R>,
      ) => [
        config.actions.updateBudgetInState({ id: r.parent.id, data: r.parent as B }, {}),
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.payload.placeholderIds, models: r.children },
          },
          ctx,
        ),
      ],
      performCreate:
        (ctx: TableContext<B>, p: api.BulkCreatePayload<api.AccountPayload>) =>
        async (): Promise<api.ClientResponse<api.ParentChildListResponse<B, C>>> => {
          /* The accounts task set can be used in the context of a Template or a Budget, which is
             determined by the `parentDomain` argument provided to the task factory (and the
             generic type parameter B).  The API endpoint will return the data for a Template if the
             budgetId in the context corresponds to a Template, or it will return the data for a
             Budget if the budgetId in the context corresponds to a Budget.  However, we still
             need to ensure that this is the case when processing the API response.

             This behavior is related to the polymorphism of the budget/template endpoints, which
             will likely be refactored in the future to have a clearer distinction between the
             template and budget domains. */
          const { response, error, ...others } = await api.bulkCreateBudgetChildren(
            { id: ctx.budgetId },
            { body: p },
          );
          if (error) {
            return { response, error } as api.ClientResponse<api.ParentChildListResponse<B, C>>;
          }
          const data = model.parseBudgetOfDomain<B>(response.parent, config.parentDomain);
          return { ...others, response: { ...response, parent: data }, error };
        },
    });

  function* bulkUpdateTask(
    ctx: TableContext<B>,
    requestPayload: api.BulkUpdatePayload<api.AccountPayload>,
  ): SagaIterator {
    const r: Awaited<ReturnType<typeof api.bulkUpdateBudgetChildren>> = yield call(
      api.bulkUpdateBudgetChildren,
      { id: ctx.budgetId },
      { body: requestPayload },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
      });
    } else {
      yield put(
        config.actions.updateBudgetInState(
          {
            id: r.response.parent.id,
            data: model.parseBudgetOfDomain(r.response.parent, config.parentDomain),
          },
          {},
        ),
      );
    }
  }

  function* updateMarkupTask(
    ctx: TableContext<B>,
    changes: tabling.RowChange<R, tabling.MarkupRowId>[],
  ): SagaIterator {
    if (changes.length !== 0) {
      const effects: (StrictEffect | null)[] = changes.map(
        (ch: tabling.RowChange<R, tabling.MarkupRowId>) => {
          const payload = tabling.patchPayload<R, C, api.MarkupPayload>(
            ch,
            /* TODO: This might break, since we updated the row data of the row change to be based
               on the model model data - we may need to tweak this such that the only columns it
               looks at are columns that are applicable to the Markup. */
            config.table.getColumns(),
          );
          if (payload !== null) {
            // TODO: Establish bulk update markups endpoint.
            return call(api.updateMarkup, { id: tabling.markupId(ch.id) }, { body: payload });
          }
          return null;
        },
      );
      const validEffects: StrictEffect[] = effects.filter(
        (eff: StrictEffect | null) => eff !== null,
      ) as StrictEffect[];

      /* Note: We will have access to the updated parent and budget for each request made to
         update a specific markup - however, the budget or parent will only change when the
         unit/rate fields are updated for the Markup via the Modal (not the table) - so we do not
         have to be concerned with updating the budget or parent in state here. */
      const responses: Awaited<ReturnType<typeof api.updateMarkup>>[] = yield all(validEffects);
      const errors = responses
        .filter((r: Awaited<ReturnType<typeof api.updateMarkup>>) => r.error !== undefined)
        .map((r: Awaited<ReturnType<typeof api.updateMarkup>>) => r.error) as errors.HttpError[];
      if (errors.length === changes.length) {
        config.table.handleRequestError(errors, {
          message: ctx.errorMessage || "There was an error updating the markups.",
          dispatchClientErrorToSentry: true,
        });
      } else {
        errors.forEach((e: errors.HttpError) => {
          // It would be nice to be able to reference the markup identifier in the error message.
          config.table.handleRequestError(e, {
            message: ctx.errorMessage || "There was an error updating the markup.",
            dispatchClientErrorToSentry: true,
          });
        });
      }
    }
  }

  function* deleteGroups(ctx: TableContext<B>, ids: number[]): SagaIterator {
    const responses: Awaited<ReturnType<typeof api.deleteGroup>>[] = yield all(
      ids.map((id: number) => call(api.deleteGroup, { id })),
    );
    const errors = responses
      .filter((r: Awaited<ReturnType<typeof api.deleteGroup>>) => r.error !== undefined)
      .map((r: Awaited<ReturnType<typeof api.deleteGroup>>) => r.error) as errors.HttpError[];
    if (errors.length === ids.length) {
      config.table.handleRequestError(errors, {
        message: ctx.errorMessage || "There was an error deleting the groups.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      errors.forEach((e: errors.HttpError) => {
        // It would be nice to be able to reference the group name in the error message.
        config.table.handleRequestError(e, {
          message: ctx.errorMessage || "There was an error deleting the group.",
          dispatchClientErrorToSentry: true,
        });
      });
    }
  }

  function* bulkDeleteRows(
    ctx: TableContext<B>,
    ids: number[],
    markupIds?: number[],
  ): SagaIterator {
    /* Note: We have do these operations sequentially, since they will both update the Budget in
       state and we cannot risk running into race conditions. */
    let errors: [errors.HttpError] | [errors.HttpError, errors.HttpError] | [] = [];
    let budget: B | null = null;
    if (ids.length !== 0) {
      const r: Awaited<ReturnType<typeof api.bulkDeleteBudgetChildren>> = yield call(
        api.bulkDeleteBudgetChildren,
        { id: ctx.budgetId },
        { body: { ids } },
      );
      if (r.error) {
        errors = [...errors, r.error];
      } else {
        budget = model.parseBudgetOfDomain(r.response.parent, config.parentDomain);
      }
    }
    if (markupIds !== undefined && markupIds.length !== 0) {
      const r: Awaited<ReturnType<typeof api.bulkDeleteBudgetMarkups>> = yield call(
        api.bulkDeleteBudgetMarkups,
        { id: ctx.budgetId },
        { body: { ids: markupIds } },
      );
      if (r.error) {
        errors = [...errors, r.error];
      } else {
        budget = model.parseBudgetOfDomain(r.response.parent, config.parentDomain);
      }
    }
    if (budget !== null) {
      yield put(config.actions.updateBudgetInState({ id: budget.id, data: budget }, {}));
    } else if (errors.length > 0) {
      /* This may dispatch two very similar errors to the user inside of the table - when ideally
         it would be 1.  However, we will likely be refactoring the error handling around the
         'handleRequestError' method soon - so we will tackle that problem then. */
      config.table.handleRequestError(errors, {
        message: ctx.errorMessage || "There was an error deleting the table rows.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      throw new Error("This should not happen!");
    }
  }

  function* handleRowRemoveFromGroupEvent(
    e: tabling.ChangeEvent<"rowRemoveFromGroup", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const requestPayload: api.BulkUpdatePayload<P> = {
      data: ids.map((id: tabling.ModelRowId) => ({
        id,
        group: null,
      })),
    };
    yield fork(
      bulkUpdateTask,
      { errorMessage: "There was an error removing the row from the group.", ...ctx },
      requestPayload,
    );
    config.table.saving(false);
  }

  function* handleAddRowToGroupEvent(
    e: tabling.ChangeEvent<"rowAddToGroup", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const requestPayload: api.BulkUpdatePayload<P> = {
      data: ids.map((id: tabling.ModelRowId) => ({
        id,
        group: tabling.groupId(e.payload.group),
      })),
    };
    yield fork(
      bulkUpdateTask,
      { errorMessage: "There was an error adding the row to the group.", ...ctx },
      requestPayload,
    );
    config.table.saving(false);
  }

  function* handleRowAddEvent(e: tabling.RowAddEvent<R>, ctx: TableContext<B>): SagaIterator {
    config.table.saving(true);
    yield call(bulkCreateTask, e, { errorMessage: "There was an error creating the rows", ...ctx });
    config.table.saving(false);
  }

  function* handleRowDeleteEvent(
    e: tabling.ChangeEvent<"rowDelete", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    const ids: tabling.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    if (ids.length !== 0) {
      config.table.saving(true);

      const modelRowIds = ids.filter((id: tabling.RowId) => tabling.isModelRowId(id)) as number[];

      const markupRowIds = (
        ids.filter((id: tabling.RowId) => tabling.isMarkupRowId(id)) as tabling.MarkupRowId[]
      ).map((id: tabling.MarkupRowId) => tabling.markupId(id));

      const groupRowIds = (
        ids.filter((id: tabling.RowId) => tabling.isGroupRowId(id)) as tabling.GroupRowId[]
      ).map((id: tabling.GroupRowId) => tabling.groupId(id));

      yield all([
        call(deleteGroups, ctx, groupRowIds),
        call(bulkDeleteRows, ctx, modelRowIds, markupRowIds),
      ]);
      config.table.saving(false);
    }
  }

  function* handleRowInsertEvent(
    e: tabling.ChangeEvent<"rowInsert", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createBudgetChild>> = yield call(
      api.createBudgetChild,
      { id: ctx.budgetId },
      {
        body: {
          previous: e.payload.previous,
          group: e.payload.group === null ? null : tabling.groupId(e.payload.group),
          ...tabling.postPayload<R, C, P>(e.payload.data, config.table.getColumns()),
        },
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error inserting the table row.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.handleEvent(
          {
            type: "modelsAdded",
            payload: {
              model: r.response,
              /* The Group is not attributed to the Model in a detail response, so if the group did
                 change then the value from the event payload has to be used. */
              group: e.payload.group !== null ? tabling.groupId(e.payload.group) : null,
            },
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
    const r: Awaited<ReturnType<typeof api.updateAccount>> = yield call(
      api.updateAccount,
      { id: e.payload.id },
      {
        body: {
          previous: e.payload.previous,
          group: e.payload.newGroup === null ? null : tabling.groupId(e.payload.newGroup),
        },
      },
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
            payload: {
              model: r.response,
              /* The Group is not attributed to the Model in a detail response, so if the group did
                 change the value from the event payload must be used to update. */
              group: e.payload.newGroup !== null ? tabling.groupId(e.payload.newGroup) : null,
            },
          },
          ctx,
        ),
      );
    }
    config.table.saving(false);
  }

  function* handleDataChangeEvent(
    e: tabling.ChangeEvent<"dataChange", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const merged = tabling.consolidateRowChanges<R>(e.payload);

    const markupChanges = merged.filter((value: tabling.RowChange<R>) =>
      tabling.isMarkupRowId(value.id),
    ) as tabling.RowChange<R, tabling.MarkupRowId>[];

    const dataChanges = merged.filter((value: tabling.RowChange<R>) =>
      tabling.isModelRowId(value.id),
    );
    yield fork(updateMarkupTask, ctx, markupChanges);
    if (dataChanges.length !== 0) {
      const requestPayload = tabling.createBulkUpdatePayload<R, C, P>(
        dataChanges,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield fork(
          bulkUpdateTask,
          {
            errorMessage: "There was an error updating the rows.",
            ...ctx,
          },
          requestPayload,
        );
      }
    }
    config.table.saving(false);
  }

  function* handleGroupAddEvent(
    e: tabling.ChangeEvent<"groupAdd", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createBudgetGroup>> = yield call(
      api.createBudgetGroup,
      { id: ctx.budgetId },
      {
        body: e.payload,
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error creating the group.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(config.actions.handleEvent({ type: "modelsAdded", payload: r.response }, ctx));
      e.onSuccess?.(r.response);
    }
    config.table.saving(false);
  }

  function* handleGroupUpdateEvent(
    e: tabling.ChangeEvent<"groupUpdate", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.updateGroup>> = yield call(
      api.updateGroup,
      { id: e.payload.id },
      {
        body: e.payload.data,
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the group.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(config.actions.handleEvent({ type: "modelsUpdated", payload: r.response }, ctx));
      e.onSuccess?.(r.response);
    }
    config.table.saving(false);
  }

  function* handleMarkupAddEvent(
    e: tabling.ChangeEvent<"markupAdd", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.createBudgetMarkup>> = yield call(
      api.createBudgetMarkup,
      { id: ctx.budgetId },
      {
        body: e.payload,
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error creating the markup.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      yield put(
        config.actions.updateBudgetInState(
          {
            id: r.response.parent.id,
            data: model.parseBudgetOfDomain(r.response.parent, config.parentDomain),
          },
          {},
        ),
      );
      yield put(config.actions.handleEvent({ type: "modelsAdded", payload: r.response.data }, ctx));
      e.onSuccess?.(r.response);
    }
    config.table.saving(false);
  }

  function* handleMarkupUpdateEvent(
    e: tabling.ChangeEvent<"markupUpdate", R>,
    ctx: TableContext<B>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.updateMarkup>> = yield call(
      api.updateMarkup,
      { id: e.payload.id },
      {
        body: e.payload.data,
      },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the markup.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      const responseData = r.response;
      if (!api.markupResponseTypeIsAncestry(responseData)) {
        yield put(
          config.actions.updateBudgetInState(
            {
              id: responseData.parent.id,
              data: model.parseBudgetOfDomain(responseData.parent, config.parentDomain),
            },
            {},
          ),
        );
        yield put(
          config.actions.handleEvent({ type: "modelsUpdated", payload: r.response.data }, ctx),
        );
        e.onSuccess?.(r.response);
      } else {
        throw new errors.MalformedDataError({
          value: r.response,
          message: "Detected corrupted response when updating the markup.",
        });
      }
    }
    config.table.saving(false);
  }

  return {
    request,
    handleChangeEvent: createChangeEventHandler<R, TableContext<B>>({
      rowRemoveFromGroup: handleRowRemoveFromGroupEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowAddCount: handleRowAddEvent,
      rowAddData: handleRowAddEvent,
      rowAddIndex: handleRowAddEvent,
      rowInsert: handleRowInsertEvent,
      groupAdd: handleGroupAddEvent,
      groupUpdate: handleGroupUpdateEvent,
      markupAdd: handleMarkupAddEvent,
      markupUpdate: handleMarkupUpdateEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
    }),
  };
};
