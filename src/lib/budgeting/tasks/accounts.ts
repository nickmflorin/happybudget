import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, select, fork, all } from "redux-saga/effects";
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
  Redux.AuthenticatedTableActionMap<R, C> & {
    readonly tableChanged: Table.ChangeEvent<R, C>;
    readonly loadingBudget: boolean;
    readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
  };

export type AccountsTableTaskConfig = Table.TaskConfig<R, C, Redux.TableActionMap<C>> & {
  readonly services: AccountsTableServiceSet;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectBudgetId: (state: Application.Authenticated.Store) => number | null;
};

export type AuthenticatedAccountsTableTaskConfig<B extends Model.Template | Model.Budget> = Table.TaskConfig<
  R,
  C,
  AuthenticatedAccountsTableActionMap<B>
> & {
  readonly services: AuthenticatedAccountsTableServiceSet<B>;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectStore: (state: Application.Authenticated.Store) => Tables.AccountTableStore;
};

const isAuthenticatedConfig = <B extends Model.Template | Model.Budget>(
  c: AccountsTableTaskConfig | AuthenticatedAccountsTableTaskConfig<B>
): c is AuthenticatedAccountsTableTaskConfig<B> => {
  return (c as AuthenticatedAccountsTableTaskConfig<B>).services.bulkCreate !== undefined;
};

/* eslint-disable indent */
export const createTableTaskSet = <B extends Model.Budget | Model.Template>(
  config: AccountsTableTaskConfig | AuthenticatedAccountsTableTaskConfig<B>
): Redux.TableTaskMap<R, C> => {
  function* request(action: Redux.Action<Redux.TableRequestPayload>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      if (redux.typeguards.isListRequestIdsAction(action)) {
        if (isAuthenticatedConfig(config)) {
          const response: Http.ListResponse<Model.Account> = yield api.request(config.services.request, objId, {
            ids: action.payload.ids
          });
          yield put(
            config.actions.tableChanged({
              type: "modelUpdated",
              payload: map(response.data, (m: Model.Account) => ({ model: m }))
            })
          );
        }
      } else {
        yield put(config.actions.loading(true));
        let effects = [
          api.request(config.services.request, objId, {}),
          api.request(config.services.requestGroups, objId, {})
        ];
        if (!isNil(config.services.requestMarkups)) {
          effects = [...effects, api.request(config.services.requestMarkups, objId, {})];
        }
        try {
          const [models, groups, markups]: [
            Http.ListResponse<C>,
            Http.ListResponse<Model.Group>,
            Http.ListResponse<Model.Markup> | undefined
          ] = yield all(effects);
          if (models.data.length === 0 && isAuthenticatedConfig(config)) {
            // If there is no table data, we want to default create two rows.
            const response: Http.BulkResponse<B, C> = yield api.request(config.services.bulkCreate, objId, {
              data: [{}, {}]
            });
            yield put(
              config.actions.response({ models: response.children, groups: groups.data, markups: markups?.data })
            );
          } else {
            yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups?.data }));
          }
        } catch (e: unknown) {
          notifications.requestError(e as Error, { message: "There was an error retrieving the table data." });
          yield put(config.actions.response({ models: [], groups: [], markups: [] }));
        } finally {
          yield put(config.actions.loading(false));
        }
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
        columns: config.columns,
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
        notifications.requestError(err as Error, { message: errorMessage });
      } finally {
        yield put(config.actions.saving(false));
        if (isGroupEvent !== true) {
          yield put(config.actions.loadingBudget(false));
        }
      }
    }
  }

  function* updateMarkupTask(changes: Table.RowChange<R, Table.MarkupRowId>[]): SagaIterator {
    if (isAuthenticatedConfig(config) && changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, Table.MarkupRowId>) => {
        const payload = tabling.http.patchPayload<R, Http.MarkupPayload, C>(ch, config.columns);
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
        notifications.requestError(err as Error, { message: "There was an error updating the table rows." });
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

  function* handleRowRemoveFromGroupEvent(e: Table.RowRemoveFromGroupEvent): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(ids, (id: Table.ModelRowId) => ({
          id,
          group: null
        }))
      };
      yield fork(bulkUpdateTask, objId, requestPayload, "There was an error removing the row from the group.", true);
    }
  }

  function* handleAddRowToGroupEvent(e: Table.RowAddToGroupEvent): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(ids, (id: Table.ModelRowId) => ({
          id,
          group: tabling.managers.groupId(e.payload.group)
        }))
      };
      yield fork(bulkUpdateTask, objId, requestPayload, "There was an error adding the row to the group.", true);
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(bulkCreateTask)) {
      yield fork(bulkCreateTask, e, "There was an error creating the rows", objId);
    }
  }

  function* handleRowDeleteEvent(e: Table.RowDeleteEvent): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const objId = yield select(config.selectObjId);
      if (!isNil(objId)) {
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
            yield all([call(deleteGroups, groupRowIds), call(bulkDeleteRows, objId, modelRowIds, markupRowIds)]);
          } catch (err: unknown) {
            notifications.requestError(err as Error, { message: "There was an error removing the rows." });
          } finally {
            yield put(config.actions.saving(false));
            yield put(config.actions.loadingBudget(false));
          }
        }
      }
    }
  }

  function* handleRowInsertEvent(e: Table.RowInsertEvent<R>): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const objId = yield select(config.selectObjId);
      if (!isNil(objId)) {
        yield put(config.actions.saving(true));
        try {
          const response: C = yield api.request(config.services.create, objId, {
            previous: e.payload.previous,
            group: isNil(e.payload.group) ? null : tabling.managers.groupId(e.payload.group),
            ...tabling.http.postPayload(e.payload.data, config.columns)
          });
          /* The Group is not attributed to the Model in a detail response, so
					   if the group did change we have to use the value from the event
						 payload. */
          yield put(
            config.actions.tableChanged({
              type: "modelAdded",
              payload: {
                model: response,
                group: !isNil(e.payload.group) ? tabling.managers.groupId(e.payload.group) : null
              }
            })
          );
        } catch (err: unknown) {
          notifications.requestError(err as Error, { message: "There was an error adding the row." });
        } finally {
          yield put(config.actions.saving(false));
        }
      }
    }
  }

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent): SagaIterator {
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
          config.actions.tableChanged({
            type: "modelUpdated",
            payload: {
              model: response,
              group: !isNil(e.payload.newGroup) ? tabling.managers.groupId(e.payload.newGroup) : null
            }
          })
        );
      } catch (err: unknown) {
        notifications.requestError(err as Error, { message: "There was an error moving the row." });
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* handleDataChangeEvent(e: Table.DataChangeEvent<R>): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const objId = yield select(config.selectObjId);
      if (!isNil(objId)) {
        const merged = tabling.events.consolidateRowChanges<R>(e.payload);

        const markupChanges: Table.RowChange<R, Table.MarkupRowId>[] = filter(merged, (value: Table.RowChange<R>) =>
          tabling.typeguards.isMarkupRowId(value.id)
        ) as Table.RowChange<R, Table.MarkupRowId>[];

        const dataChanges: Table.RowChange<R, Table.ModelRowId>[] = filter(merged, (value: Table.RowChange<R>) =>
          tabling.typeguards.isModelRowId(value.id)
        ) as Table.RowChange<R, Table.ModelRowId>[];
        yield fork(updateMarkupTask, markupChanges);
        if (dataChanges.length !== 0) {
          const requestPayload = tabling.http.createBulkUpdatePayload<R, P, C>(dataChanges, config.columns);
          if (requestPayload.data.length !== 0) {
            yield fork(bulkUpdateTask, objId, requestPayload, "There was an error updating the rows.");
          }
        }
      }
    }
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler<R, C>({
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
