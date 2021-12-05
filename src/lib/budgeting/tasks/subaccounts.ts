import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, select, fork, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { createTaskSet } from "store/tasks/contacts";
import { tabling, redux, notifications } from "lib";

type R = Tables.SubAccountRowData;
type C = Model.SubAccount;
type P = Http.SubAccountPayload;

export type SubAccountsTableServiceSet = {
  request: (id: number, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<C>>;
  requestGroups: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Group>>;
  requestFringes: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Fringe>>;
  requestMarkups?: (
    id: number,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Markup>>;
};

export type AuthenticatedSubAccountsTableServiceSet<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = SubAccountsTableServiceSet & {
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BudgetBulkDeleteResponse<B, M>>;
  bulkDeleteMarkups?: (
    id: number,
    ids: number[],
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkDeleteResponse<B, M>>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkResponse<B, M, C>>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkResponse<B, M, C>>;
};

export type SubAccountsTableActionMap = Redux.TableActionMap<C> & {
  readonly loadingBudget: boolean;
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
  readonly responseFringes: Http.TableResponse<Model.Fringe>;
};

export type AuthenticatedSubAccountsTableActionMap<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = Redux.AuthenticatedTableActionMap<R, C> & {
  readonly loadingBudget: boolean;
  readonly tableChanged: Table.ChangeEvent<R, M>;
  readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
  readonly updateParentInState: Redux.UpdateActionPayload<M>;
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
  readonly responseFringes: Http.TableResponse<Model.Fringe>;
};

export type SubAccountsTableTaskConfig = Table.TaskConfig<R, C, SubAccountsTableActionMap> & {
  readonly services: SubAccountsTableServiceSet;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectBudgetId: (state: Application.Authenticated.Store) => number | null;
};

export type AuthenticatedSubAccountsTableTaskConfig<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = Table.TaskConfig<R, C, AuthenticatedSubAccountsTableActionMap<M, B>> & {
  readonly services: AuthenticatedSubAccountsTableServiceSet<M, B>;
  readonly selectBudgetId: (state: Application.Authenticated.Store) => number | null;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectStore: (state: Application.Authenticated.Store) => Tables.SubAccountTableStore;
};

const isAuthenticatedConfig = <M extends Model.Account | Model.SubAccount, B extends Model.Template | Model.Budget>(
  c: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): c is AuthenticatedSubAccountsTableTaskConfig<M, B> => {
  return (c as AuthenticatedSubAccountsTableTaskConfig<M, B>).services.bulkCreate !== undefined;
};

/* eslint-disable indent */
export const createTableTaskSet = <M extends Model.Account | Model.SubAccount, B extends Model.Budget | Model.Template>(
  config: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): Redux.TableTaskMap<R, C> => {
  const contactsTasks = createTaskSet({ authenticated: isAuthenticatedConfig(config) });

  function* request(action: Redux.Action<Redux.TableRequestPayload>): SagaIterator {
    const objId = yield select(config.selectObjId);
    const budgetId = yield select(config.selectBudgetId);

    if (!isNil(objId) && !isNil(budgetId)) {
      if (redux.typeguards.isListRequestIdsAction(action)) {
        if (isAuthenticatedConfig(config)) {
          const response: Http.ListResponse<Model.SubAccount> = yield api.request(config.services.request, objId, {
            ids: action.payload.ids
          });
          yield put(
            config.actions.tableChanged({
              type: "modelUpdated",
              payload: map(response.data, (m: Model.SubAccount) => ({ model: m }))
            })
          );
        }
      } else {
        yield put(config.actions.loading(true));
        yield put(config.actions.clear(null));

        let effects = [
          api.request(config.services.request, objId, {}),
          api.request(config.services.requestGroups, objId, {})
        ];
        if (!isNil(config.services.requestMarkups)) {
          effects = [...effects, api.request(config.services.requestMarkups, objId, {})];
        }

        try {
          yield fork(contactsTasks.request, action as Redux.Action<null>);
          yield fork(requestSubAccountUnits);
          yield fork(requestFringes, budgetId);
          const [models, groups, markups]: [
            Http.ListResponse<C>,
            Http.ListResponse<Model.Group>,
            Http.ListResponse<Model.Markup> | undefined
          ] = yield all(effects);

          if (models.data.length === 0 && isAuthenticatedConfig(config)) {
            // If there is no table data, we want to default create two rows.
            const response: Http.BudgetBulkResponse<B, M, C> = yield api.request(config.services.bulkCreate, objId, {
              data: [{}, {}]
            });
            yield put(
              config.actions.response({ models: response.children, groups: groups.data, markups: markups?.data })
            );
          } else {
            yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups?.data }));
          }
        } catch (e: unknown) {
          notifications.requestError(e as Error, "There was an error retrieving the table data.");
          yield put(config.actions.response({ models: [], markups: [], groups: [] }));
        } finally {
          yield put(config.actions.loading(false));
        }
      }
    }
  }

  function* requestFringes(objId: number): SagaIterator {
    try {
      const response: Http.ListResponse<Model.Fringe> = yield api.request(config.services.requestFringes, objId, {});
      yield put(config.actions.responseFringes({ models: response.data }));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the table fringes.");
      yield put(config.actions.responseFringes({ models: [] }));
    }
  }

  function* requestSubAccountUnits(): SagaIterator {
    try {
      const response = yield api.request(api.getSubAccountUnits);
      yield put(config.actions.responseSubAccountUnits(response));
    } catch (e: unknown) {
      notifications.requestError(e as Error, "There was an error retrieving the table units.");
      yield put(config.actions.responseSubAccountUnits({ data: [], count: 0 }));
    }
  }

  const bulkCreateTask: Redux.TableBulkCreateTask<R, [number]> | null = !isAuthenticatedConfig(config)
    ? null
    : tabling.tasks.createBulkTask<
        R,
        C,
        Tables.SubAccountTableStore,
        Http.SubAccountPayload,
        Http.BudgetBulkResponse<B, M, C>,
        [number]
      >({
        columns: config.columns,
        selectStore: config.selectStore,
        loadingActions: [config.actions.saving, config.actions.loadingBudget],
        responseActions: (r: Http.BudgetBulkResponse<B, M, C>, e: Table.RowAddEvent<R>) => [
          config.actions.updateBudgetInState({ id: r.budget.id, data: r.budget }),
          config.actions.updateParentInState({ id: r.data.id, data: r.data }),
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
      if (!isGroupEvent) {
        yield put(config.actions.loadingBudget(true));
      }
      try {
        const response: Http.BudgetBulkResponse<B, M, C> = yield api.request(
          config.services.bulkUpdate,
          objId,
          requestPayload
        );
        yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
        yield put(config.actions.updateParentInState({ id: response.data.id, data: response.data }));
      } catch (err: unknown) {
        notifications.requestError(err as Error, errorMessage);
      } finally {
        yield put(config.actions.loadingBudget(false));
        yield put(config.actions.saving(false));
      }
    }
  }

  function* updateMarkupTask(changes: Table.RowChange<R, Table.MarkupRowId>[]): SagaIterator {
    if (isAuthenticatedConfig(config) && changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, Table.MarkupRowId>) => {
        const payload = tabling.http.patchPayloadForChange<R, Http.MarkupPayload, C>(ch, config.columns);
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
        Note: We will have access to the updated parent and budget for each request made to update
        a specific markup - however, the budget or parent will only change when the unit/rate fields
        are updated for the Markup via the Modal (not the table) - so we do not have to be concerned
        with updating the budget or parent in state here.
        */
        yield all(validEffects);
      } catch (err: unknown) {
        notifications.requestError(err as Error, "There was an error updating the table rows.");
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* deleteGroups(ids: number[]): SagaIterator {
    yield all(map(ids, (id: number) => api.request(api.deleteGroup, id)));
  }

  function* bulkDeleteRows(objId: number, ids: number[], markupIds?: number[]): SagaIterator {
    // Note: We have do these operations sequentially, since they will both update the Budget in state
    // and we cannot risk running into race conditions.
    if (isAuthenticatedConfig(config)) {
      let response: Http.BudgetBulkDeleteResponse<B, M> | null = null;
      if (ids.length !== 0) {
        response = yield api.request(config.services.bulkDelete, objId, ids);
      }
      if (!isNil(markupIds) && markupIds.length !== 0 && !isNil(config.services.bulkDeleteMarkups)) {
        response = yield api.request(config.services.bulkDeleteMarkups, objId, markupIds);
      }
      if (!isNil(response)) {
        yield put(config.actions.updateParentInState({ id: response.data.id, data: response.data }));
        yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
      }
    }
  }

  function* handleRemoveRowFromGroupEvent(e: Table.RowRemoveFromGroupEvent): SagaIterator {
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

  function* handleRowPositionChangedEvent(e: Table.RowPositionChangedEvent): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      yield put(config.actions.saving(true));
      try {
        const response: C = yield api.request(api.updateSubAccount, e.payload.id, {
          previous: e.payload.previous,
          group: isNil(e.payload.newGroup) ? null : tabling.managers.groupId(e.payload.newGroup)
        });
        // The Group is not attributed to the Model in a detail response, so if the group
        // did change we have to use the value from the event payload.
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
        notifications.requestError(err as Error, "There was an error moving the row.");
      } finally {
        yield put(config.actions.saving(false));
      }
    }
  }

  function* handleRowAddEvent(e: Table.RowAddEvent<R>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(bulkCreateTask)) {
      yield fork(bulkCreateTask, e, "There was an error creating the rows.", objId);
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
            notifications.requestError(err as Error, "There was an error removing the rows.");
          } finally {
            yield put(config.actions.saving(false));
            yield put(config.actions.loadingBudget(false));
          }
        }
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
            yield call(bulkUpdateTask, objId, requestPayload, "There was an error updating the rows.");
          }
        }
      }
    }
  }

  return {
    request,
    handleChangeEvent: tabling.tasks.createChangeEventHandler({
      rowRemoveFromGroup: handleRemoveRowFromGroupEvent,
      rowAddToGroup: handleAddRowToGroupEvent,
      rowAdd: handleRowAddEvent,
      rowDelete: handleRowDeleteEvent,
      dataChange: handleDataChangeEvent,
      rowPositionChanged: handleRowPositionChangedEvent
    })
  };
};
