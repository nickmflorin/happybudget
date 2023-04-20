import { SagaIterator } from "redux-saga";
import { CallEffect, StrictEffect, call, put, fork, all, select } from "redux-saga/effects";

import { errors } from "application";
import { logger } from "internal";
import { tabling, notifications, model } from "lib";

import * as cache from "../../cache";
import * as api from "../../../../application/api";
import * as actions from "../../../../application/store/actions";
import * as types from "../../../../application/store/types";
import * as contacts from "../contacts";
import { createBulkCreateTask, createChangeEventHandler } from "../tabling";

type R = model.SubAccountRow;
type C = model.SubAccount;
type P = api.SubAccountPayload;

type TableContext<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
> = B extends model.UserBudget | model.Template
  ? types.SubAccountsTableActionContext<B, M, false>
  : B extends model.AnotherUserBudget
  ? types.SubAccountsTableActionContext<B, M, true>
  : never;

type PublicSubAccountsTableActionMap<
  B extends model.Template | model.Budget = model.AnotherUserBudget,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  CTX extends TableContext = TableContext<B, M>,
> = Omit<
  types.ActionCreatorMap<types.AuthenticatedTableActionPayloadMap<R, C>, CTX>,
  "invalidate"
> & {
  readonly responseFringes: types.ActionCreator<
    types.TableResponse<model.Fringe>,
    types.FringesTableActionContext<B, M>
  >;
};

type PublicSubAccountsTableTaskConfig<
  B extends model.Template | model.Budget = model.AnotherUserBudget,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  CTX extends TableContext = TableContext<B, M>,
> = {
  readonly parentDomain: "budget";
  readonly public: true;
  readonly actions: PublicSubAccountsTableActionMap<B, M, CTX>;
  readonly table: tabling.TableInstance<R, C>;
  readonly selectIndexedStore: (
    s: types.ApplicationStore,
  ) => types.ModelIndexedStore<types.AccountOrSubAccountStore<M>>;
  readonly selectBudgetStore: (s: types.ApplicationStore) => types.PublicBudgetStore;
};

type AuthenticatedSubAccountsTableActionMap<
  B extends model.Template | model.Budget = model.UserBudget | model.Template,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  CTX extends TableContext = TableContext<B, M>,
> = Omit<
  types.ActionCreatorMap<types.AuthenticatedTableActionPayloadMap<R, C>, CTX>,
  "invalidate"
> & {
  readonly handleEvent: types.ActionCreator<tabling.AnyTableEvent<R, C>, CTX>;
  readonly responseFringes: types.ActionCreator<
    types.TableResponse<model.Fringe>,
    types.FringesTableActionContext<B, M>
  >;
  readonly updateBudgetInState: types.ActionCreator<types.UpdateModelPayload<B>>;
  readonly updateParentInState: types.ActionCreator<
    types.UpdateModelPayload<M>,
    types.AccountOrSubAccountActionContext<B, M>
  >;
};

type AuthenticatedSubAccountsTableTaskConfig<
  B extends model.Template | model.Budget,
  M extends model.Account | model.SubAccount = model.Account | model.SubAccount,
  CTX extends TableContext = TableContext<B, M>,
> = {
  readonly table: tabling.TableInstance<R, C>;
  readonly actions: AuthenticatedSubAccountsTableActionMap<B, M, CTX>;
  readonly public: false;
  readonly initialState: types.AccountOrSubAccountStore<M>;
  readonly parentDomain: B["domain"];
  readonly parentType: M["type"];
  readonly selectIndexedStore: (
    s: types.ApplicationStore,
  ) => types.ModelIndexedStore<types.AccountOrSubAccountStore<M>>;
  readonly selectBudgetStore: (s: types.ApplicationStore) => types.BudgetStoreLookup<B, false>;
};

const isAuthenticatedConfig = <
  B extends model.Template | model.Budget,
  M extends model.Account | model.SubAccount,
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>,
): config is AuthenticatedSubAccountsTableTaskConfig<B, M> =>
  (config as AuthenticatedSubAccountsTableTaskConfig<B, M>).public === false;

const requestFringes = <
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>,
) =>
  function* task(
    action: types.Action<null, TableContext<B, M>>,
  ): SagaIterator<api.ClientResponse<api.ApiListResponse<model.Fringe>>> {
    const r: Awaited<ReturnType<typeof api.getFringes>> = yield call(api.getFringes, {
      id: action.context.budgetId,
    });
    if (r.error) {
      return r;
    }
    /* Note: There are cases here where the previous response could have failed and subsequent
       responses will not create the table data because this task will not execute in the case that
       a response was already received.  We should keep track of whether or not the last response
       was an error, so we can make decisions like that here. */
    if (isAuthenticatedConfig<B, M>(config) && r.response.data.length === 0) {
      // If there is no table data, we want to default create two rows.
      const newFringes: Awaited<ReturnType<typeof api.bulkCreateFringes>> = yield call(
        api.bulkCreateFringes,
        { id: action.context.budgetId },
        { body: { data: [{}, {}] as api.FringePayload[] } },
      );
      if (newFringes.error !== undefined) {
        // Use the request meta of the original request to obtain the fringes.
        return { error: newFringes.error, response: undefined, requestMeta: r.requestMeta };
      }
      yield put(
        config.actions.updateBudgetInState(
          {
            id: action.context.budgetId,
            data: model.parseBudgetOfDomain(newFringes.response.parent, config.parentDomain),
          },
          {},
        ),
      );
      return {
        error: undefined,
        // Use the request meta of the original request to obtain the fringes.
        requestMeta: r.requestMeta,
        response: {
          data: newFringes.response.children,
          count: newFringes.response.children.length,
        },
      };
    }
    return r;
  };

const requestSupplementaryTableData = <
  B extends model.Template | model.Budget,
  M extends model.Account | model.SubAccount,
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>,
): ((action: types.Action<null, TableContext<B, M>>) => SagaIterator<void>) =>
  function* task(action: types.Action<null, TableContext<B, M>>): SagaIterator<void> {
    const effects: [
      CallEffect<api.ClientResponse<api.ApiListResponse<model.SubAccountUnit>> | null>,
      CallEffect<api.ClientResponse<api.ApiListResponse<string>> | null>,
      CallEffect<api.ClientResponse<api.ApiListResponse<model.Fringe>> | null>,
    ] = [
      cache.wrapListRequestEffect<model.SubAccountUnit>(call(api.getSubAccountUnits), action, {
        selectStore: (s: types.ApplicationStore) => s.subaccountUnits,
      }),
      cache.wrapListRequestEffect<string>(call(api.getFringeColors), action, {
        selectStore: (s: types.ApplicationStore) => s.fringeColors,
      }),
      cache.wrapListRequestEffect<model.Fringe>(call(requestFringes(config), action), action, {
        selectStore: (s: types.ApplicationStore) => config.selectBudgetStore(s).fringes,
      }),
    ];
    const [subaccountUnitsR, fringeColorsR, fringesR]: [
      api.ClientResponse<api.ApiListResponse<model.SubAccountUnit>> | null,
      api.ClientResponse<api.ApiListResponse<string>> | null,
      api.ClientResponse<api.ApiListResponse<model.Fringe>> | null,
    ] = yield cache.wrapListRequestEffects(effects, {
      errorMessage:
        action.context.errorMessage || "There was an error retrieving supplementary table data.",
      table: config.table,
      errorDetail: "The table may not behave as expected.",
    });
    if (subaccountUnitsR !== null) {
      yield put(actions.responseSubAccountUnitsAction(subaccountUnitsR, {}));
    }
    if (fringeColorsR !== null) {
      yield put(actions.responseFringeColorsAction(fringeColorsR, {}));
    }
    if (fringesR !== null) {
      const fringesContext = {
        parentId: action.context.parentId,
        parentType: action.context.parentType,
        domain: action.context.domain,
        budgetId: action.context.budgetId,
      };
      const fringesAction = config.actions.responseFringes as types.ActionCreator<
        types.TableResponse<model.Fringe>,
        | types.FringesTableActionContext<model.Budget | model.Template, M>
        | types.FringesTableActionContext<model.AnotherUserBudget, M>
      >;
      if (fringesR.error !== undefined) {
        yield put(
          fringesAction(fringesR, {
            ...fringesContext,
            public: !isAuthenticatedConfig(config),
          }),
        );
      } else {
        yield put(
          fringesAction(
            { models: fringesR.response.data },
            { ...fringesContext, public: !isAuthenticatedConfig(config) },
          ),
        );
      }
    }
  };

const getRequestEffects = <
  B extends model.Template | model.Budget,
  M extends model.Account | model.SubAccount,
>(
  config: PublicSubAccountsTableTaskConfig<B, M> | AuthenticatedSubAccountsTableTaskConfig<B, M>,
  action: types.Action<types.TableRequestActionPayload, TableContext<B, M>>,
): [
  CallEffect<api.ClientResponse<api.ApiListResponse<model.SubAccount>>>,
  CallEffect<api.ClientResponse<api.ApiListResponse<model.Group>>>,
  CallEffect<api.ClientResponse<api.ApiListResponse<model.Markup>>>,
  CallEffect<void>,
] => {
  const requestService =
    action.context.parentType === "account" ? api.getAccountChildren : api.getSubAccountChildren;
  const requestGroupsService =
    action.context.parentType === "account" ? api.getAccountGroups : api.getSubAccountGroups;
  const requestMarkupsService =
    action.context.parentType === "account" ? api.getAccountMarkups : api.getSubAccountMarkups;
  return [
    /* If any of the requests to obtain the primary data used to render the table fail, the entire
       batch of requests will be cancelled and the table will not be rendered. */
    call(requestService, { id: action.context.parentId }),
    call(requestGroupsService, { id: action.context.parentId }),
    call(requestMarkupsService, { id: action.context.parentId }),
    /* We want to treat the request to fetch the supplementary table data separately and as one
       task, such that we only dispatch one error notification in the case that it fails and we can
       differentiate between failed requests to obtain the data necessary to render the table and
       failed requests to obtain the data necessary to ensure the entities related to the core table
       data are present.

       The request to fetch the supplementary table data will not throw a hard error in the case
       that it fails (due to the internal mechanics of the wrapListRequestEffects method) - but will
       instead just return empty list response objects.

       Note: We do not want to pass in a potentially forced payload ({force: true})	to the chained
       task `requestSupplementaryTableData`.  This is because that forced payload referred to the
       request to fetch the primary table data, not the supplementary table data.  We do want to
       re-request supplementary table data in the case that it had already been received. */
    call(requestSupplementaryTableData(config), {
      payload: null,
      type: action.type,
      context: action.context,
    } as types.Action<null, TableContext<B, M>>),
  ];
};

type RequestTableData<
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
  CTX extends TableContext<B, M> = TableContext<B, M>,
> = {
  (
    action: types.Action<types.TableRequestActionPayload, CTX>,
    config:
      | AuthenticatedSubAccountsTableTaskConfig<B, M, CTX>
      | PublicSubAccountsTableTaskConfig<B, M, CTX>,
    options: {
      onResponse: (r: types.SuccessfulTableResponse<model.SubAccount>) => SagaIterator;
      onError: (errors: [errors.HttpError, ...errors.HttpError[]]) => void;
    },
  ): SagaIterator;
};

function* requestTableData<
  B extends model.Budget | model.Template,
  M extends model.Account | model.SubAccount,
  CTX extends TableContext<B, M> = TableContext<B, M>,
>(
  action: types.Action<types.TableRequestActionPayload, CTX>,
  config:
    | AuthenticatedSubAccountsTableTaskConfig<B, M, CTX>
    | PublicSubAccountsTableTaskConfig<B, M, CTX>,
  options: {
    onResponse: (r: types.SuccessfulTableResponse<model.SubAccount>) => SagaIterator;
    onError: (errors: [errors.HttpError, ...errors.HttpError[]]) => void;
  },
): SagaIterator {
  yield put(config.actions.loading(true, action.context));
  const effects = getRequestEffects<B, M>(config, action);

  const [modelsR, groupsR, markupsR]: [
    Awaited<
      ReturnType<typeof api.getAccountChildren> | ReturnType<typeof api.getSubAccountChildren>
    >,
    Awaited<ReturnType<typeof api.getAccountGroups> | ReturnType<typeof api.getSubAccountGroups>>,
    Awaited<ReturnType<typeof api.getAccountMarkups> | ReturnType<typeof api.getSubAccountMarkups>>,
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
      api.ApiListResponse<model.SubAccount>,
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

export const createPublicSubAccountsTableTaskSet = <M extends model.Account | model.SubAccount>(
  config: PublicSubAccountsTableTaskConfig<model.AnotherUserBudget, M>,
): types.TableTaskMap<TableContext<model.AnotherUserBudget, M>> => {
  function* request(
    action: types.Action<types.TableRequestActionPayload, TableContext<model.AnotherUserBudget, M>>,
  ): SagaIterator {
    if (types.tableRequestActionIsListIds(action)) {
      throw new Error("Requesting by individual IDs is only supported in authenticated modes.");
    }
    const canUseCachedResponse = yield select((s: types.ApplicationStore) =>
      cache.canUseCachedIndexedListResponse(
        config.selectIndexedStore(s),
        (si: types.AccountOrSubAccountStore<M>) => si.table,
        action.context.parentId,
      ),
    );
    if (!canUseCachedResponse || types.tableRequestActionIsForced(action)) {
      yield call(requestTableData as RequestTableData<model.AnotherUserBudget, M>, action, config, {
        onResponse: function* (r: types.TableResponse<model.SubAccount>) {
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

export const createAuthenticatedSubAccountsTableTaskSet = <
  B extends model.Template | model.UserBudget,
  M extends model.Account | model.SubAccount,
>(
  config: AuthenticatedSubAccountsTableTaskConfig<B, M>,
): types.AuthenticatedTableTaskMap<R, TableContext<B, M>> => {
  const selectTableStore = (
    s: types.ApplicationStore,
    ctx: TableContext<B, M>,
  ): types.SubAccountTableStore => {
    const baseStore = config.selectIndexedStore(s);
    return baseStore[ctx.parentId].table || config.initialState.table;
  };

  function* request(
    action: types.Action<types.TableRequestActionPayload, TableContext<B, M>>,
  ): SagaIterator {
    if (types.tableRequestActionIsListIds(action)) {
      const getService: typeof api.getAccountChildren | typeof api.getSubAccountChildren = {
        account: api.getAccountChildren,
        subaccount: api.getSubAccountChildren,
      }[config.parentType];

      const r: Awaited<ReturnType<typeof getService>> = yield call(
        getService,
        { id: action.context.parentId },
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
              payload: r.response.data.map((m: model.SubAccount) => ({ model: m })),
            },
            action.context,
          ),
        );
      }
    } else {
      const canUseCachedResponse = yield select((s: types.ApplicationStore) =>
        cache.canUseCachedIndexedListResponse(
          config.selectIndexedStore(s),
          (si: types.AccountOrSubAccountStore<M>) => si.table,
          action.context.parentId,
        ),
      );
      if (!canUseCachedResponse || types.tableRequestActionIsForced(action)) {
        /* TODO: We might want to move the contacts request to the batched requests to retrieve the
           supplementary data. */
        yield fork(contacts.requestContacts, action.context);

        yield call(requestTableData as RequestTableData<B, M>, action, config, {
          onResponse: function* (r: types.SuccessfulTableResponse<model.SubAccount>) {
            const bulkCreateService:
              | typeof api.bulkCreateAccountChildren
              | typeof api.bulkCreateSubAccountChildren = {
              account: api.bulkCreateAccountChildren,
              subaccount: api.bulkCreateSubAccountChildren,
            }[config.parentType];
            const newModels: Awaited<ReturnType<typeof bulkCreateService>> = yield call(
              bulkCreateService,
              { id: action.context.parentId },
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
                  "Failed to automatically create two rows for subaccounts table.  The table " +
                    "will be shown with no prepopulated rows.",
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
                  parentId: action.context.parentId,
                } as TableContext<B, M>),
              );
            } else {
              const budget = model.parseBudgetOfDomain<B>(
                newModels.response.budget,
                config.parentDomain,
              );
              const parent = model.parseParentOfType(newModels.response.parent, config.parentType);
              const actionContext = {
                budgetId: action.context.budgetId,
                parentId: action.context.parentId,
                public: action.context.public,
                parentType: config.parentType,
                domain: action.context.domain,
              };
              yield put(config.actions.updateBudgetInState({ id: budget.id, data: budget }, {}));
              yield put(
                config.actions.updateParentInState(
                  { id: parent.id, data: parent },
                  { ...actionContext, id: parent.id },
                ),
              );
              yield put(
                config.actions.response(
                  { models: newModels.response.children, markups: r.markups, groups: r.groups },
                  actionContext as TableContext<B, M>,
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

  const bulkCreateTask: (e: tabling.RowAddEvent<R>, ctx: TableContext<B, M>) => SagaIterator =
    createBulkCreateTask({
      table: config.table,
      selectStore: selectTableStore,
      responseActions: (
        ctx: TableContext<B, M>,
        r: api.AncestryListResponse<B, M, C>,
        e: tabling.RowAddEvent<R>,
      ) => [
        config.actions.updateBudgetInState({ id: r.budget.id, data: r.budget }, {}),
        config.actions.updateParentInState(
          { id: r.parent.id, data: r.parent },
          { id: r.parent.id, domain: ctx.domain, budgetId: ctx.budgetId, public: ctx.public },
        ),
        config.actions.handleEvent(
          {
            type: "placeholdersActivated",
            payload: { placeholderIds: e.payload.placeholderIds, models: r.children },
          },
          ctx,
        ),
      ],
      performCreate:
        (ctx: TableContext<B, M>, p: api.BulkCreatePayload<api.SubAccountPayload>) =>
        async (): Promise<api.ClientResponse<api.AncestryListResponse<B, M, C>>> => {
          const service:
            | typeof api.bulkCreateAccountChildren
            | typeof api.bulkCreateSubAccountChildren = {
            account: api.bulkCreateAccountChildren,
            subaccount: api.bulkCreateSubAccountChildren,
          }[config.parentType];
          const { response, error, ...others } = await service({ id: ctx.budgetId }, { body: p });
          if (error) {
            return { response, error } as api.ClientResponse<api.AncestryListResponse<B, M, C>>;
          }
          const budget = model.parseBudgetOfDomain<B>(response.budget, config.parentDomain);
          const parent = model.parseParentOfType(response.parent, config.parentType);
          return { ...others, response: { ...response, parent, budget }, error };
        },
    });

  function* bulkUpdateTask(
    ctx: TableContext<B, M>,
    requestPayload: api.BulkUpdatePayload<api.SubAccountPayload>,
  ): SagaIterator {
    const service: typeof api.bulkUpdateAccountChildren | typeof api.bulkUpdateSubAccountChildren =
      {
        account: api.bulkUpdateAccountChildren,
        subaccount: api.bulkUpdateSubAccountChildren,
      }[config.parentType];
    const r: Awaited<ReturnType<typeof service>> = yield call(
      service,
      { id: ctx.budgetId },
      { body: requestPayload },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the table rows.",
      });
    } else {
      yield put(
        config.actions.updateParentInState(
          {
            id: r.response.parent.id,
            data: model.parseParentOfType(r.response.parent, config.parentType),
          },
          {
            id: r.response.parent.id,
            domain: ctx.domain,
            budgetId: ctx.budgetId,
            public: ctx.public,
          },
        ),
      );
      yield put(
        config.actions.updateBudgetInState(
          {
            id: r.response.parent.id,
            data: model.parseBudgetOfDomain(r.response.budget, config.parentDomain),
          },
          {},
        ),
      );
    }
  }

  function* updateMarkupTask(
    ctx: TableContext<B, M>,
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

      config.table.saving(true);
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
      config.table.saving(false);
    }
  }

  function* deleteGroups(ctx: TableContext<B, M>, ids: number[]): SagaIterator {
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
    ctx: TableContext<B, M>,
    ids: number[],
    markupIds?: number[],
  ): SagaIterator {
    const service: typeof api.bulkDeleteAccountChildren | typeof api.bulkDeleteSubAccountChildren =
      {
        account: api.bulkDeleteAccountChildren,
        subaccount: api.bulkDeleteSubAccountChildren,
      }[ctx.parentType];

    const markupService = {
      account: api.bulkDeleteAccountMarkups,
      subaccount: api.bulkDeleteSubAccountMarkups,
      // I do not know why coercing this like this is required - but it has to do with the generic.
    }[ctx.parentType as "account" | "subaccount"];

    /* Note: We have do these operations sequentially, since they will both update the Budget in
       state and we cannot risk running into race conditions. */
    let errors: [errors.HttpError] | [errors.HttpError, errors.HttpError] | [] = [];
    let related: [B, M] | null = null;
    if (ids.length !== 0) {
      const r: Awaited<ReturnType<typeof service>> = yield call(
        service,
        { id: ctx.parentId },
        { body: { ids } },
      );
      if (r.error) {
        errors = [...errors, r.error];
      } else {
        related = [
          model.parseBudgetOfDomain(r.response.budget, config.parentDomain),
          model.parseParentOfType(r.response.parent, config.parentType),
        ];
      }
    }
    if (markupIds !== undefined && markupIds.length !== 0) {
      const r: Awaited<ReturnType<typeof markupService>> = yield call(
        markupService,
        { id: ctx.parentId },
        { body: { ids: markupIds } },
      );
      if (r.error) {
        errors = [...errors, r.error];
      } else {
        related = [
          model.parseBudgetOfDomain(r.response.budget, config.parentDomain),
          model.parseParentOfType(r.response.parent, config.parentType),
        ];
      }
    }
    if (related !== null) {
      yield put(
        config.actions.updateParentInState(
          { id: related[1].id, data: related[1] },
          { id: related[1].id, domain: ctx.domain, budgetId: ctx.budgetId, public: ctx.public },
        ),
      );
      yield put(config.actions.updateBudgetInState({ id: related[0].id, data: related[0] }, {}));
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
    ctx: TableContext<B, M>,
  ): SagaIterator {
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
  }

  function* handleAddRowToGroupEvent(
    e: tabling.ChangeEvent<"rowAddToGroup", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
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
  }

  function* handleRowInsertEvent(
    e: tabling.ChangeEvent<"rowInsert", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    const service: typeof api.createAccountChild | typeof api.createSubAccountChild = {
      account: api.createAccountChild,
      subaccount: api.createSubAccountChild,
    }[ctx.parentType];

    const r: Awaited<ReturnType<typeof service>> = yield call(
      service,
      { id: ctx.parentId },
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
  }

  function* handleRowPositionChangedEvent(
    e: tabling.ChangeEvent<"rowPositionChanged", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    const r: Awaited<ReturnType<typeof api.updateSubAccount>> = yield call(
      api.updateSubAccount,
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
  }

  function* handleRowAddEvent(e: tabling.RowAddEvent<R>, ctx: TableContext<B, M>): SagaIterator {
    config.table.saving(true);
    yield call(bulkCreateTask, e, { errorMessage: "There was an error creating the rows", ...ctx });
    config.table.saving(false);
  }

  function* handleRowDeleteEvent(
    e: tabling.ChangeEvent<"rowDelete", R>,
    ctx: TableContext<B, M>,
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

  function* handleDataChangeEvent(
    e: tabling.ChangeEvent<"dataChange", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    config.table.saving(true);
    const merged = tabling.consolidateRowChanges<R>(e.payload);

    const markupChanges: tabling.RowChange<R, tabling.MarkupRowId>[] = merged.filter(
      (value: tabling.RowChange<R>) => tabling.isMarkupRowId(value.id),
    ) as tabling.RowChange<R, tabling.MarkupRowId>[];

    const dataChanges: tabling.RowChange<R, tabling.ModelRowId>[] = merged.filter(
      (value: tabling.RowChange<R>) => tabling.isModelRowId(value.id),
    ) as tabling.RowChange<R, tabling.ModelRowId>[];

    yield fork(updateMarkupTask, ctx, markupChanges);
    if (dataChanges.length !== 0) {
      const requestPayload = tabling.createBulkUpdatePayload<R, C, P>(
        dataChanges,
        config.table.getColumns(),
      );
      if (requestPayload.data.length !== 0) {
        yield call(bulkUpdateTask, ctx, requestPayload);
      }
    }
    config.table.saving(false);
  }

  function* handleGroupAddEvent(
    e: tabling.ChangeEvent<"groupAdd", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    const service: typeof api.createAccountGroup | typeof api.createSubAccountGroup = {
      account: api.createAccountGroup,
      subaccount: api.createSubAccountGroup,
    }[config.parentType];

    config.table.saving(true);
    const r: Awaited<ReturnType<typeof service>> = yield call(
      service,
      { id: ctx.parentId },
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

  function* handleMarkupAddEvent(
    e: tabling.ChangeEvent<"markupAdd", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    const service: typeof api.createAccountMarkup | typeof api.createSubAccountMarkup = {
      account: api.createAccountMarkup,
      subaccount: api.createSubAccountMarkup,
    }[config.parentType];

    config.table.saving(true);
    const r: Awaited<ReturnType<typeof service>> = yield call(
      service,
      { id: ctx.parentId },
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
            data: model.parseBudgetOfDomain(r.response.budget, config.parentDomain),
          },
          {},
        ),
      );
      yield put(
        config.actions.updateParentInState(
          {
            id: r.response.parent.id,
            data: model.parseParentOfType(r.response.parent, config.parentType),
          },
          {
            id: r.response.parent.id,
            domain: ctx.domain,
            budgetId: ctx.budgetId,
            public: ctx.public,
          },
        ),
      );
      yield put(config.actions.handleEvent({ type: "modelsAdded", payload: r.response.data }, ctx));
      e.onSuccess?.(r.response);
    }
    config.table.saving(false);
  }

  function* handleMarkupUpdateEvent(
    e: tabling.ChangeEvent<"markupUpdate", R>,
    ctx: TableContext<B, M>,
  ): SagaIterator {
    config.table.saving(true);
    const r: Awaited<ReturnType<typeof api.updateMarkup>> = yield call(
      api.updateMarkup,
      { id: e.payload.id },
      { body: e.payload.data },
    );
    if (r.error) {
      config.table.handleRequestError(r.error, {
        message: ctx.errorMessage || "There was an error updating the markup.",
        dispatchClientErrorToSentry: true,
      });
    } else {
      const responseData = r.response;
      if (api.markupResponseTypeIsAncestry(responseData)) {
        yield put(
          config.actions.updateBudgetInState(
            {
              id: responseData.parent.id,
              data: model.parseBudgetOfDomain(responseData.budget, config.parentDomain),
            },
            {},
          ),
        );
        yield put(
          config.actions.updateParentInState(
            {
              id: responseData.parent.id,
              data: model.parseParentOfType(responseData.parent, config.parentType),
            },
            {
              id: responseData.parent.id,
              domain: ctx.domain,
              budgetId: ctx.budgetId,
              public: ctx.public,
            },
          ),
        );
        yield put(
          config.actions.handleEvent({ type: "modelsUpdated", payload: responseData.data }, ctx),
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
    handleChangeEvent: createChangeEventHandler<R, TableContext<B, M>>({
      rowRemoveFromGroup: handleRowRemoveFromGroupEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowAddCount: handleRowAddEvent,
      rowAddData: handleRowAddEvent,
      rowAddIndex: handleRowAddEvent,
      rowInsert: handleRowInsertEvent,
      groupAdd: handleGroupAddEvent,
      /* Not sure why this was not implemented before!
         groupUpdate: handleGroupUpdateEvent, */
      markupAdd: handleMarkupAddEvent,
      markupUpdate: handleMarkupUpdateEvent,
      rowPositionChanged: handleRowPositionChangedEvent,
    }),
  };
};
