import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, fork, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { tabling, redux, notifications } from "lib";

type R = Tables.AccountRowData;
type C = Model.Account;
type P = Http.AccountPayload;

export type AccountsTableServiceSet = {
  readonly request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<C>>;
  readonly requestGroups: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Group>>;
  readonly requestMarkups?: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Markup>>;
};

export type AuthenticatedAccountsTableServiceSet<B extends Model.Template | Model.Budget> = AccountsTableServiceSet & {
  readonly create: (id: number, payload: P, options?: Http.RequestOptions) => Promise<C>;
  readonly bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BulkDeleteResponse<B>>;
  readonly bulkDeleteMarkups?: (
    id: number,
    ids: number[],
    options: Http.RequestOptions
  ) => Promise<Http.BulkDeleteResponse<B>>;
  readonly bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, C>>;
  readonly bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BulkResponse<B, C>>;
};

export type AuthenticatedAccountsTableActionMap<B extends Model.Template | Model.Budget> =
  Redux.AuthenticatedTableActionMap<R, C, Tables.AccountTableContext> & {
    readonly tableChanged: Redux.ContextActionCreator<Table.ChangeEvent<R, C>, Tables.AccountTableContext>;
    readonly loadingBudget: Redux.ActionCreator<boolean>;
    readonly updateBudgetInState: Redux.ActionCreator<Redux.UpdateActionPayload<B>>;
  };

export type AccountsTableTaskConfig = Table.TaskConfig<
  R,
  C,
  Tables.AccountTableContext,
  Redux.TableActionMap<C, Tables.AccountTableContext>
> & {
  readonly services: AccountsTableServiceSet;
};

export type AuthenticatedAccountsTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  C,
  Tables.AccountTableContext,
  AuthenticatedAccountsTableActionMap<B>
> & {
  readonly services: AuthenticatedAccountsTableServiceSet<B>;
  readonly selectStore: (state: Application.AuthenticatedStore) => Tables.AccountTableStore;
};

const isAuthenticatedConfig = <B extends Model.Template | Model.Budget>(
  c: AccountsTableTaskConfig | AuthenticatedAccountsTableTaskConfig<B>
): c is AuthenticatedAccountsTableTaskConfig<B> => {
  return (c as AuthenticatedAccountsTableTaskConfig<B>).services.bulkCreate !== undefined;
};

export const createTableTaskSet = <B extends Model.Budget | Model.Template>(
  config: AccountsTableTaskConfig | AuthenticatedAccountsTableTaskConfig<B>
): Redux.TableTaskMap<R, C, Tables.AccountTableContext> => {
  function* request(
    action: Redux.ActionWithContext<Redux.TableRequestPayload, Tables.AccountTableContext>
  ): SagaIterator {
    yield put(config.actions.response({ models: [], groups: [], markups: [] }));
    if (redux.typeguards.isListRequestIdsAction(action)) {
      if (isAuthenticatedConfig(config)) {
        const response: Http.ListResponse<Model.Account> = yield api.request(
          config.services.request,
          action.context.budgetId,
          { ids: action.payload.ids }
        );
        yield put(
          config.actions.tableChanged(
            {
              type: "modelUpdated",
              payload: map(response.data, (m: Model.Account) => ({ model: m }))
            },
            action.context
          )
        );
      }
    } else {
      yield put(config.actions.loading(true));
      let effects = [
        api.request(config.services.request, action.context.budgetId, {}),
        api.request(config.services.requestGroups, action.context.budgetId, {})
      ];
      if (!isNil(config.services.requestMarkups)) {
        effects = [...effects, api.request(config.services.requestMarkups, action.context.budgetId, {})];
      }
      try {
        const [models, groups, markups]: [
          Http.ListResponse<C>,
          Http.ListResponse<Model.Group>,
          Http.ListResponse<Model.Markup> | undefined
        ] = yield all(effects);
        if (models.data.length === 0 && isAuthenticatedConfig(config)) {
          // If there is no table data, we want to default create two rows.
          const response: Http.BulkResponse<B, C> = yield api.request(
            config.services.bulkCreate,
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
          err.permissionError.code === "subscription_permission_error"
        ) {
          notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
        } else {
          config.table.handleRequestError(e as Error, { message: "There was an error retrieving the table data." });
        }
        yield put(config.actions.response({ models: [], groups: [], markups: [] }));
      } finally {
        yield put(config.actions.loading(false));
      }
    }
  }

  const bulkCreateTask: Redux.TableBulkCreateTask<R, [number]> | null = !isAuthenticatedConfig(config)
    ? null
    : tabling.tasks.createBulkTask<
        R,
        C,
        Tables.AccountTableStore,
        Http.AccountPayload,
        Http.BulkResponse<B, C>,
        [number]
      >({
        table: config.table,
        selectStore: config.selectStore,
        loadingActions: [config.actions.saving, config.actions.loadingBudget],
        /*
          Note: We also have access to the updated Account from the response
          (as response.data) so we could use this to update the overall Account
          in state.

          However, the reducer handles that logic pre-request currently, although
          in the future we may want to use the response data as the
					fallback/source of truth.
          */
        responseActions: (r: Http.BulkResponse<B, C>, e: Table.RowAddEvent<R>) => [
          config.actions.updateBudgetInState({ id: r.data.id, data: r.data }),
          config.actions.addModelsToState({ placeholderIds: e.placeholderIds, models: r.children })
        ],
        bulkCreate: (objId: number) => [config.services.bulkCreate, objId]
      });

  function* bulkUpdateTask(
    objId: number,
    requestPayload: Http.BulkUpdatePayload<Http.AccountPayload>,
    errorMessage: string,
    isGroupEvent = false
  ): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      yield put(config.actions.saving(true));
      if (isGroupEvent !== true) {
        yield put(config.actions.loadingBudget(true));
      }
      try {
        const response: Http.BulkResponse<B, C> = yield api.request(config.services.bulkUpdate, objId, requestPayload);
        yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, { message: errorMessage });
      } finally {
        yield put(config.actions.saving(false));
        if (isGroupEvent !== true) {
          yield put(config.actions.loadingBudget(false));
        }
      }
    }
  }

  function* updateMarkupTask(changes: Table.RowChange<R, Table.MarkupRow<R>>[]): SagaIterator {
    if (isAuthenticatedConfig(config) && changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, Table.MarkupRow<R>>) => {
        const payload = tabling.http.patchPayload<R, C, Http.MarkupPayload>(ch, config.table.getColumns());
        if (!isNil(payload)) {
          return api.request(api.updateMarkup, tabling.managers.markupId(ch.id), payload);
        }
        return null;
      });
      const validEffects: StrictEffect[] = filter(
        effects,
        (eff: StrictEffect | null) => eff !== null
      ) as StrictEffect[];

      yield put(config.actions.saving(true));
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
        config.table.handleRequestError(err as Error, { message: "There was an error updating the table rows." });
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* deleteGroups(ids: number[]): SagaIterator {
    yield all(map(ids, (id: number) => api.request(api.deleteGroup, id)));
  }

  function* bulkDeleteRows(objId: number, ids: number[], markupIds?: number[]): SagaIterator {
    /* Note: We have do these operations sequentially, since they will both
			 update the Budget in state and we cannot risk running into race
			 conditions. */
    if (isAuthenticatedConfig(config)) {
      let response: Http.BulkDeleteResponse<B> | null = null;
      if (ids.length !== 0) {
        response = yield api.request(config.services.bulkDelete, objId, ids);
      }
      if (!isNil(markupIds) && markupIds.length !== 0 && !isNil(config.services.bulkDeleteMarkups)) {
        response = yield api.request(config.services.bulkDeleteMarkups, objId, markupIds);
      }
      if (!isNil(response)) {
        yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
      }
    }
  }

  function* handleRowRemoveFromGroupEvent(
    e: Table.RowRemoveFromGroupEvent,
    context: Tables.AccountTableContext
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
      context.budgetId,
      requestPayload,
      "There was an error removing the row from the group.",
      true
    );
  }

  function* handleAddRowToGroupEvent(e: Table.RowAddToGroupEvent, context: Tables.AccountTableContext): SagaIterator {
    const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
    const requestPayload: Http.BulkUpdatePayload<P> = {
      data: map(ids, (id: Table.ModelRowId) => ({
        id,
        group: tabling.managers.groupId(e.payload.group)
      }))
    };
    yield fork(
      bulkUpdateTask,
      context.budgetId,
      requestPayload,
      "There was an error adding the row to the group.",
      true
    );
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>, context: Tables.AccountTableContext): SagaIterator {
    if (!isNil(bulkCreateTask)) {
      yield fork(bulkCreateTask, e, "There was an error creating the rows", context.budgetId);
    }
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent, context: Tables.AccountTableContext): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      if (ids.length !== 0) {
        yield put(config.actions.loadingBudget(true));
        yield put(config.actions.saving(true));

        const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];

        const markupRowIds = map(
          filter(ids, (id: Table.RowId) => tabling.typeguards.isMarkupRowId(id)) as Table.MarkupRowId[],
          (id: Table.MarkupRowId) => tabling.managers.markupId(id)
        ) as number[];

        const groupRowIds = map(
          filter(ids, (id: Table.RowId) => tabling.typeguards.isGroupRowId(id)) as Table.GroupRowId[],
          (id: Table.GroupRowId) => tabling.managers.groupId(id)
        );

        try {
          yield all([
            call(deleteGroups, groupRowIds),
            call(bulkDeleteRows, context.budgetId, modelRowIds, markupRowIds)
          ]);
        } catch (err: unknown) {
          config.table.handleRequestError(err as Error, { message: "There was an error removing the table rows." });
        } finally {
          yield put(config.actions.saving(false));
          yield put(config.actions.loadingBudget(false));
        }
      }
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>, context: Tables.AccountTableContext): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      yield put(config.actions.saving(true));
      try {
        const response: C = yield api.request(config.services.create, context.budgetId, {
          previous: e.payload.previous,
          group: isNil(e.payload.group) ? null : tabling.managers.groupId(e.payload.group),
          ...tabling.http.postPayload<R, C, P>(e.payload.data, config.table.getColumns())
        });
        /* The Group is not attributed to the Model in a detail response, so
					 if the group did change we have to use the value from the event
					 payload. */
        yield put(
          config.actions.tableChanged(
            {
              type: "modelAdded",
              payload: {
                model: response,
                group: !isNil(e.payload.group) ? tabling.managers.groupId(e.payload.group) : null
              }
            },
            context
          )
        );
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, { message: "There was an error adding the table rows." });
        notifications.requestError(err as Error);
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* handleRowPositionChangedEvent(
    e: Table.RowPositionChangedEvent,
    context: Tables.AccountTableContext
  ): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      yield put(config.actions.saving(true));
      try {
        const response: C = yield api.request(api.updateAccount, e.payload.id, {
          previous: e.payload.previous,
          group: isNil(e.payload.newGroup) ? null : tabling.managers.groupId(e.payload.newGroup)
        });
        /* The Group is not attributed to the Model in a detail response, so if
					 the group did change we have to use the value from the event
					 payload. */
        yield put(
          config.actions.tableChanged(
            {
              type: "modelUpdated",
              payload: {
                model: response,
                group: !isNil(e.payload.newGroup) ? tabling.managers.groupId(e.payload.newGroup) : null
              }
            },
            context
          )
        );
      } catch (err: unknown) {
        config.table.handleRequestError(err as Error, { message: "There was an error moving the table rows." });
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>, context: Tables.AccountTableContext): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const merged = tabling.events.consolidateRowChanges<R>(e.payload);

      const markupChanges: Table.RowChange<R, Table.MarkupRow<R>>[] = filter(merged, (value: Table.RowChange<R>) =>
        tabling.typeguards.isMarkupRowId(value.id)
      ) as Table.RowChange<R, Table.MarkupRow<R>>[];

      const dataChanges: Table.RowChange<R, Table.ModelRow<R>>[] = filter(merged, (value: Table.RowChange<R>) =>
        tabling.typeguards.isModelRowId(value.id)
      ) as Table.RowChange<R, Table.ModelRow<R>>[];

      yield fork(updateMarkupTask, markupChanges);
      if (dataChanges.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, C, P>(dataChanges, config.table.getColumns());
        if (requestPayload.data.length !== 0) {
          yield fork(bulkUpdateTask, context.budgetId, requestPayload, "There was an error updating the rows.");
        }
      }
    }
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler<R, C, Tables.AccountTableContext>({
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
