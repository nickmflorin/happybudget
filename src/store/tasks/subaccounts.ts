import { SagaIterator } from "redux-saga";
import { StrictEffect, CallEffect, call, put, fork, all, select } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { tabling, notifications, redux, http } from "lib";
import * as actions from "../actions";
import * as contacts from "./contacts";

type R = Tables.SubAccountRowData;
type C = Model.SubAccount;
type P = Http.SubAccountPayload;

type PublicSubAccountsTableActionMap<
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
> = Redux.ActionCreatorMap<
  Omit<Redux.TableActionPayloadMap<C>, "invalidate">,
  SubAccountsTableActionContext<B, M, true>
> & {
  readonly responseFringes: Redux.ActionCreator<
    Http.TableResponse<Model.Fringe>,
    FringesTableActionContext<B, M, true>
  >;
};

type AuthenticatedSubAccountsTableActionMap<
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
> = Redux.ActionCreatorMap<
  Omit<Redux.AuthenticatedTableActionPayloadMap<R, C>, "invalidate">,
  SubAccountsTableActionContext<B, M, false>
> & {
  readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateModelPayload<B>>;
  readonly updateParentInState: Redux.ActionCreator<Redux.UpdateModelPayload<M>>;
  readonly responseFringes: Redux.ActionCreator<
    Http.TableResponse<Model.Fringe>,
    FringesTableActionContext<B, M, false>
  >;
};

type PublicSubAccountsTableTaskConfig<
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
> = Omit<
  Table.TaskConfig<
    R,
    C,
    Tables.SubAccountTableStore,
    SubAccountsTableActionContext<B, M, true>,
    PublicSubAccountsTableActionMap<B, M>
  >,
  "selectStore"
> & {
  readonly selectIndexedStore: (s: Application.Store) => Redux.ModelIndexedStore<Modules.AccountOrSubAccountStore<M>>;
  readonly selectBudgetStore: (s: Application.Store) => Modules.PublicBudget.Store;
};

type AuthenticatedSubAccountsTableTaskConfig<
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
> = Omit<
  Table.TaskConfig<
    R,
    C,
    Tables.SubAccountTableStore,
    SubAccountsTableActionContext<B, M, false>,
    AuthenticatedSubAccountsTableActionMap<B, M>
  >,
  "selectStore"
> & {
  readonly initialState: Modules.AccountOrSubAccountStore<M>;
  readonly selectIndexedStore: (s: Application.Store) => Redux.ModelIndexedStore<Modules.AccountOrSubAccountStore<M>>;
  readonly selectBudgetStore: (s: Application.Store) => Modules.BudgetStoreLookup<B, false>;
};

const isAuthenticatedConfig = <B extends Model.Template | Model.Budget, M extends Model.Account | Model.SubAccount>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>
): config is AuthenticatedSubAccountsTableTaskConfig<B, M> =>
  (config as AuthenticatedSubAccountsTableTaskConfig<B, M>).actions.handleEvent !== undefined;

const requestFringes = <
  M extends Model.Account | Model.SubAccount,
  B extends Model.Budget | Model.Template,
  PUBLIC extends boolean
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>
) =>
  function* task(action: Redux.Action<null, SubAccountsTableActionContext<B, M, PUBLIC>>): SagaIterator {
    const response: Http.ListResponse<Model.Fringe> = yield http.request(
      api.getFringes,
      action.context,
      action.context.budgetId
    );
    /*
		Note: There are cases here where the previous response could have failed
		and subsequent responses will not create the table data because this task
		will not execute in the case that a response was already received.  We
		should keep track of whether or not the last response was an error, so
    we can make decisions like that here.
		*/
    if (isAuthenticatedConfig(config) && response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const bulkCreateResponse: Http.ServiceResponse<typeof api.bulkCreateFringes> = yield http.request(
        api.bulkCreateFringes,
        action.context,
        action.context.budgetId,
        { data: [{}, {}] }
      );
      yield put(
        config.actions.updateBudgetInState({ id: action.context.budgetId, data: bulkCreateResponse.parent as B }, {})
      );
      const r = yield call(() => ({ data: bulkCreateResponse.children, count: response.data.length }));
      return r as Http.ListResponse<Model.Fringe>;
    } else {
      const r = yield call(() => response);
      return r as Http.ListResponse<Model.Fringe>;
    }
  };

const requestSupplementaryTableData = <
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>
) =>
  function* task(action: Redux.Action<null, SubAccountsTableActionContext<B, M, PUBLIC>>): SagaIterator {
    const effects: [
      CallEffect<Redux.ListRequestEffectRTWithError<Model.Tag>>,
      CallEffect<Redux.ListRequestEffectRTWithError<string>>,
      CallEffect<Redux.ListRequestEffectRTWithError<Model.Fringe>>
    ] = [
      redux.wrapListRequestEffect(http.request(api.getSubAccountUnits, action.context), action, {
        selectStore: (s: Application.Store) => s.subaccountUnits
      }),
      redux.wrapListRequestEffect(http.request(api.getFringeColors, action.context), action, {
        selectStore: (s: Application.Store) => s.fringeColors
      }),
      redux.wrapListRequestEffect(call(requestFringes(config), action), action, {
        selectStore: (s: Application.Store) => config.selectBudgetStore(s).fringes
      })
    ];
    const [subaccountUnits, fringeColors, fringes]: [
      Http.RenderedListResponse<Model.Tag> | null,
      Http.RenderedListResponse<string> | null,
      Http.RenderedListResponse<Model.Fringe> | null
    ] = yield redux.wrapListRequestEffects(effects, {
      errorMessage: action.context.errorMessage || "There was an error retrieving supplementary table data.",
      table: config.table,
      errorDetail: "The table may not behave as expected."
    });
    if (subaccountUnits !== null) {
      yield put(actions.responseSubAccountUnitsAction(subaccountUnits, {}));
    }
    if (fringeColors !== null) {
      yield put(actions.responseFringeColorsAction(fringeColors, {}));
    }
    if (fringes !== null) {
      const fringesContext = {
        parentId: action.context.parentId,
        parentType: action.context.parentType,
        domain: action.context.domain,
        budgetId: action.context.budgetId
      };
      if (http.listResponseFailed(fringes)) {
        if (isAuthenticatedConfig(config)) {
          yield put(
            config.actions.responseFringes(fringes, {
              ...fringesContext,
              public: false
            })
          );
        } else {
          yield put(
            config.actions.responseFringes(fringes, {
              ...fringesContext,
              public: true
            })
          );
        }
      } else {
        if (isAuthenticatedConfig(config)) {
          yield put(config.actions.responseFringes({ models: fringes.data }, { ...fringesContext, public: false }));
        } else {
          yield put(config.actions.responseFringes({ models: fringes.data }, { ...fringesContext, public: true }));
        }
      }
    }
  };

const getRequestEffects = <
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>,
  action: Redux.Action<Redux.TableRequestPayload, SubAccountsTableActionContext<B, M, PUBLIC>>
): [
  CallEffect<Http.ListResponse<Model.SubAccount>>,
  CallEffect<Http.ListResponse<Model.Group>>,
  CallEffect<Http.ListResponse<Model.Markup>>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  CallEffect<any>
] => {
  const requestService = action.context.parentType === "account" ? api.getAccountChildren : api.getSubAccountChildren;
  const requestGroupsService = action.context.parentType === "account" ? api.getAccountGroups : api.getSubAccountGroups;
  const requestMarkupsService =
    action.context.parentType === "account" ? api.getAccountMarkups : api.getSubAccountMarkups;
  return [
    /*
		If any of the requests to obtain the primary data used to render the table
		fail, the entire batch of requests will be cancelled and the table will
		not be rendered.
		*/
    http.request(requestService, action.context, action.context.parentId),
    http.request(requestGroupsService, action.context, action.context.parentId),
    http.request(requestMarkupsService, action.context, action.context.parentId),
    /*
		We want to treat the request to fetch the supplementary table data
		separately and as one task, such that we only dispatch one error
		notification in the case that it fails and we can differentiate between
		failed requests to obtain the data necessary to render the table and failed
		requests to obtain the data necessary to ensure the entities related to
		the core table data are present.

		The request to fetch the supplementary table data will not throw a hard error
		in the case that it fails (due to the internal mechanics of the
		wrapListRequestEffects method) - but will instead just return empty list
		response objects.

		Note: We do not want to pass in a potentially forced payload ({force: true})
		to the chained task `requestSupplementaryTableData`.  This is because that
		forced payload referred to the request to fetch the primary table data, not
		the supplementary table data.  We do want to re-request supplementary table
		data in the case that it had already been received.
		*/
    call(requestSupplementaryTableData(config), {
      payload: null,
      type: action.type,
      context: action.context
    } as Redux.Action<null, SubAccountsTableActionContext<B, M, PUBLIC>>)
  ];
};

export const createPublicTableTaskSet = <
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
>(
  config: PublicSubAccountsTableTaskConfig<B, M>
): Redux.TableTaskMap<SubAccountsTableActionContext<B, M, true>> => {
  function* request(
    action: Redux.Action<Redux.TableRequestPayload, SubAccountsTableActionContext<B, M, true>>
  ): SagaIterator {
    if (redux.tableRequestActionIsListIds(action)) {
      throw new Error("Requesting by individual IDs is only supported in authenticated modes.");
    }
    const canUseCachedResponse = yield select((s: Application.Store) =>
      redux.canUseCachedIndexedListResponse(
        config.selectIndexedStore(s),
        (si: Modules.AccountOrSubAccountStore<M>) => si.table,
        action.context.parentId
      )
    );
    if (!canUseCachedResponse || redux.requestActionIsForced(action)) {
      yield put(config.actions.loading(true, action.context));
      const effects = getRequestEffects(
        config,
        action as Redux.Action<Redux.RequestPayload, SubAccountsTableActionContext<B, M, true>>
      );
      try {
        const [models, groups, markups]: [
          Http.ListResponse<C>,
          Http.ListResponse<Model.Group>,
          Http.ListResponse<Model.Markup>
        ] = yield all(effects);
        yield put(
          config.actions.response({ models: models.data, groups: groups.data, markups: markups.data }, action.context)
        );
      } catch (e: unknown) {
        config.table.handleRequestError(e as Error, {
          message: action.context.errorMessage || "There was an error retrieving the table data.",
          dispatchClientErrorToSentry: true
        });
        // Non api.RequestError will be thrown in the above block.
        yield put(config.actions.response({ error: e as api.RequestError }, action.context));
      } finally {
        yield put(config.actions.loading(false, action.context));
      }
    }
  }
  return { request };
};

export const createAuthenticatedTableTaskSet = <
  B extends Model.Template | Model.Budget,
  M extends Model.Account | Model.SubAccount
>(
  config: AuthenticatedSubAccountsTableTaskConfig<B, M>
): Redux.AuthenticatedTableTaskMap<R, SubAccountsTableActionContext<B, M, false>> => {
  const selectTableStore = (
    s: Application.Store,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): Tables.SubAccountTableStore => {
    const baseStore = config.selectIndexedStore(s);
    return baseStore[ctx.parentId].table || config.initialState.table;
  };

  function* request(
    action: Redux.Action<Redux.TableRequestPayload, SubAccountsTableActionContext<B, M, false>>
  ): SagaIterator {
    if (redux.tableRequestActionIsListIds(action)) {
      const requestService =
        action.context.parentType === "account" ? api.getAccountChildren : api.getSubAccountChildren;
      const response: Http.ListResponse<Model.SubAccount> = yield http.request(
        requestService,
        action.context,
        action.context.parentId,
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
      const canUseCachedResponse = yield select((s: Application.Store) =>
        redux.canUseCachedIndexedListResponse(
          config.selectIndexedStore(s),
          (si: Modules.AccountOrSubAccountStore<M>) => si.table,
          action.context.parentId
        )
      );
      if (!canUseCachedResponse || redux.requestActionIsForced(action)) {
        yield put(config.actions.loading(true, action.context));
        const effects = getRequestEffects(config, action);
        try {
          /* TODO: We might want to move the contacts request to the batched
             requests to retrieve the supplementary data. */
          yield fork(contacts.request, action.context);
          const [models, groups, markups]: [
            Http.ListResponse<C>,
            Http.ListResponse<Model.Group>,
            Http.ListResponse<Model.Markup>
          ] = yield all(effects);
          if (models.data.length === 0) {
            const bulkCreateService =
              action.context.parentType === "account"
                ? api.bulkCreateAccountChildren
                : api.bulkCreateSubAccountChildren;
            // If there is no table data, we want to default create two rows.
            const response: Http.ServiceResponse<typeof bulkCreateService> = yield http.request(
              bulkCreateService,
              action.context,
              action.context.parentId,
              { data: [{}, {}] }
            );
            yield put(
              config.actions.response(
                { models: response.children, groups: groups.data, markups: markups.data },
                action.context
              )
            );
          } else {
            yield put(
              config.actions.response(
                { models: models.data, groups: groups.data, markups: markups.data },
                action.context
              )
            );
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
          yield put(config.actions.response({ error: e as api.RequestError }, action.context));
        } finally {
          yield put(config.actions.loading(false, action.context));
        }
      }
    }
  }

  const bulkCreateTask: (e: Table.RowAddEvent<R>, ctx: SubAccountsTableActionContext<B, M, false>) => SagaIterator =
    tabling.createBulkTask({
      table: config.table,
      service: (ctx: SubAccountsTableActionContext<B, M, false>) =>
        (ctx.parentType === "account" ? api.bulkCreateAccountChildren : api.bulkCreateSubAccountChildren) as (
          id: number,
          payload: Http.BulkCreatePayload<Http.AccountPayload>,
          options?: Http.RequestOptions
        ) => Promise<Http.AncestryListResponse<B, M, Model.SubAccount>>,
      selectStore: selectTableStore,
      responseActions: (
        ctx: SubAccountsTableActionContext<B, M, false>,
        r: Http.AncestryListResponse<B, M, C>,
        e: Table.RowAddEvent<R>
      ) => [
        config.actions.updateBudgetInState({ id: r.budget.id, data: r.budget }, {}),
        config.actions.updateParentInState({ id: r.parent.id, data: r.parent }, {}),
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.placeholderIds, models: r.children }
          },
          ctx
        )
      ],
      performCreate: (
        ctx: SubAccountsTableActionContext<B, M, false>,
        p: Http.BulkCreatePayload<Http.SubAccountPayload>
      ): [number, Http.BulkCreatePayload<Http.SubAccountPayload>] => [ctx.parentId, p]
    });

  function* bulkUpdateTask(
    ctx: SubAccountsTableActionContext<B, M, false>,
    requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>
  ): SagaIterator {
    const service = ctx.parentType === "account" ? api.bulkUpdateAccountChildren : api.bulkUpdateSubAccountChildren;
    config.table.saving(true);
    try {
      const response: Http.ServiceResponse<typeof service> = yield http.request(
        service,
        ctx,
        ctx.parentId,
        requestPayload
      );
      yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget as B }, {}));
      yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent as M }, {}));
    } catch (err: unknown) {
      config.table.handleRequestError(err as Error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
        dispatchClientErrorToSentry: true
      });
    } finally {
      config.table.saving(false);
    }
  }

  function* updateMarkupTask(
    ctx: SubAccountsTableActionContext<B, M, false>,
    changes: Table.RowChange<R, Table.MarkupRow<R>>[]
  ): SagaIterator {
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

  function* deleteGroups(ctx: SubAccountsTableActionContext<B, M, false>, ids: number[]): SagaIterator {
    yield all(map(ids, (id: number) => http.request(api.deleteGroup, ctx, id)));
  }

  function* bulkDeleteRows(
    ctx: SubAccountsTableActionContext<B, M, false>,
    ids: number[],
    markupIds?: number[]
  ): SagaIterator {
    const service = ctx.parentType === "account" ? api.bulkDeleteAccountChildren : api.bulkDeleteSubAccountChildren;
    const markupService = ctx.parentType === "account" ? api.bulkDeleteAccountMarkups : api.bulkDeleteSubAccountMarkups;
    /* Note: We have do these operations sequentially, since they will both
			 update the Budget in state and we cannot risk running into race
			 conditions. */
    let response: Http.ServiceResponse<typeof service> | null = null;
    if (ids.length !== 0) {
      response = yield http.request(service, ctx, ctx.parentId, { ids });
    }
    if (!isNil(markupIds) && markupIds.length !== 0) {
      response = yield http.request(markupService, ctx, ctx.parentId, { ids: markupIds });
    }
    if (!isNil(response)) {
      yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent as M }, {}));
      yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget as B }, {}));
    }
  }

  function* handleRemoveRowFromGroupEvent(
    e: Table.RowRemoveFromGroupEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
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

  function* handleAddRowToGroupEvent(
    e: Table.RowAddToGroupEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
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

  function* handleRowInsertEvent(
    e: Table.RowInsertEvent<R>,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
    const service = ctx.parentType === "account" ? api.createAccountChild : api.createSubAccountChild;
    const response: C = yield http.request(service, ctx, ctx.parentId, {
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

  function* handleRowPositionChangedEvent(
    e: Table.RowPositionChangedEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
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

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, ctx: SubAccountsTableActionContext<B, M, false>): SagaIterator {
    if (!isNil(bulkCreateTask)) {
      yield call(bulkCreateTask, e, ctx);
    }
  }

  function* handleRowDeleteEvent(
    e: Table.RowDeleteEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
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

  function* handleDataChangeEvent(
    e: Table.DataChangeEvent<R>,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
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

  function* handleGroupAddEvent(e: Table.GroupAddEvent, ctx: SubAccountsTableActionContext<B, M, false>): SagaIterator {
    const service = ctx.parentType === "account" ? api.createAccountGroup : api.createSubAccountGroup;
    const response: Model.Group = yield http.request(service, ctx, ctx.parentId, e.payload);
    yield put(config.actions.handleEvent({ type: "modelsAdded", payload: response }, ctx));
    e.onSuccess?.(response);
  }

  function* handleMarkupAddEvent(
    e: Table.MarkupAddEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
    const service = ctx.parentType === "account" ? api.createAccountMarkup : api.createSubAccountMarkup;
    const response: Http.AncestryResponse<B, M, Model.Markup> = yield http.request(
      service,
      ctx,
      ctx.parentId,
      e.payload
    );
    yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }, {}));
    yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }, {}));
    yield put(config.actions.handleEvent({ type: "modelsAdded", payload: response.data }, ctx));
    e.onSuccess?.(response);
  }

  function* handleMarkupUpdateEvent(
    e: Table.MarkupUpdateEvent,
    ctx: SubAccountsTableActionContext<B, M, false>
  ): SagaIterator {
    const response: Http.AncestryResponse<B, M, Model.Markup> = yield http.request(
      api.updateMarkup,
      ctx,
      e.payload.id,
      e.payload.data
    );
    yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }, {}));
    yield put(config.actions.updateParentInState({ id: response.parent.id, data: response.parent }, {}));
    yield put(config.actions.handleEvent({ type: "modelsUpdated", payload: response.data }, ctx));
    e.onSuccess?.(response);
  }

  return {
    request,
    handleChangeEvent: tabling.createChangeEventHandler<R, SubAccountsTableActionContext<B, M, false>>({
      rowRemoveFromGroup: handleRemoveRowFromGroupEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowAdd: handleRowAddEvent,
      rowInsert: tabling.task(handleRowInsertEvent, config.table, "There was an error adding the table rows."),
      groupAdd: tabling.task(handleGroupAddEvent, config.table, "There was an error creating the group."),
      markupAdd: tabling.task(handleMarkupAddEvent, config.table, "There was an error creating the markup."),
      markupUpdate: tabling.task(handleMarkupUpdateEvent, config.table, "There was an error updating the markup."),
      rowPositionChanged: tabling.task(
        handleRowPositionChangedEvent,
        config.table,
        "There was an error moving the table rows."
      )
    })
  };
};
