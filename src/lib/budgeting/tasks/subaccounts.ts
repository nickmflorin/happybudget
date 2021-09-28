import axios from "axios";
import { SagaIterator } from "redux-saga";
import { StrictEffect, call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import * as contactsTasks from "store/tasks/contacts";
import * as tabling from "../../tabling";

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
  bulkDelete: (id: number, ids: number[], options: Http.RequestOptions) => Promise<Http.BudgetBulkResponse<B, M>>;
  bulkDeleteMarkups?: (
    id: number,
    ids: number[],
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkResponse<B, M>>;
  bulkUpdate: (
    id: number,
    data: Http.BulkUpdatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkResponse<B, M>>;
  bulkCreate: (
    id: number,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkCreateResponse<B, M, C>>;
};

export type SubAccountsTableActionMap = Redux.TableActionMap<C> & {
  readonly loadingBudget: boolean;
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
  readonly responseFringes: Http.TableResponse<Model.Fringe>;
};

export type AuthenticatedSubAccountsTableActionMap<B extends Model.Template | Model.Budget> =
  Redux.AuthenticatedTableActionMap<R, C> & {
    readonly loadingBudget: boolean;
    readonly tableChanged: Table.ChangeEvent<R, C>;
    readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
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
> = Table.TaskConfig<R, C, AuthenticatedSubAccountsTableActionMap<B>> & {
  readonly services: AuthenticatedSubAccountsTableServiceSet<M, B>;
  readonly selectBudgetId: (state: Application.Authenticated.Store) => number | null;
  readonly selectObjId: (state: Application.Authenticated.Store) => number | null;
  readonly selectAutoIndex: (state: Application.Authenticated.Store) => boolean;
  readonly selectData: (state: Application.Authenticated.Store) => Table.Row<R, C>[];
};

const isAuthenticatedConfig = <M extends Model.Account | Model.SubAccount, B extends Model.Template | Model.Budget>(
  c: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): c is AuthenticatedSubAccountsTableTaskConfig<M, B> => {
  return (c as AuthenticatedSubAccountsTableTaskConfig<M, B>).services.bulkCreate !== undefined;
};

/* eslint-disable indent */
export const createTableTaskSet = <M extends Model.Account | Model.SubAccount, B extends Model.Budget | Model.Template>(
  config: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): Redux.TaskMapObject<Redux.TableTaskMap<R, C>> => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  function* request(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(config.selectObjId);
    const budgetId = yield select(config.selectBudgetId);
    if (!isNil(objId) && !isNil(budgetId)) {
      yield put(config.actions.loading(true));
      yield put(config.actions.clear(null));
      try {
        yield fork(contactsTasks.request, action);
        yield fork(requestSubAccountUnits);
        yield fork(requestFringes, budgetId);
        const [models, groups, markups]: [
          Http.ListResponse<C>,
          Http.ListResponse<Model.Group>,
          Http.ListResponse<Model.Markup>
        ] = yield all([call(requestSubAccounts, objId), call(requestGroups, objId), call(requestMarkups, objId)]);
        if (models.data.length === 0 && isAuthenticatedConfig(config)) {
          // If there is no table data, we want to default create two rows.
          const response: Http.BudgetBulkCreateResponse<B, M, C> = yield call(
            config.services.bulkCreate,
            objId,
            { data: [{}, {}] },
            { cancelToken: source.token }
          );
          yield put(config.actions.response({ models: response.children, groups: groups.data }));
        } else {
          yield put(config.actions.response({ models: models.data, groups: groups.data, markups: markups.data }));
        }
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the table data.");
          yield put(config.actions.response({ models: [], markups: [], groups: [] }));
        }
      } finally {
        yield put(config.actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  const requestSubAccounts = (objId: number): Promise<Http.ListResponse<C>> =>
    config.services.request(objId, { no_pagination: true }, { cancelToken: source.token });

  const requestGroups = (objId: number): Promise<Http.ListResponse<Model.Group>> =>
    config.services.requestGroups(objId, { no_pagination: true }, { cancelToken: source.token });

  const requestMarkups = (objId: number): Promise<Http.ListResponse<Model.Markup>> => {
    if (!isNil(config.services.requestMarkups)) {
      return config.services.requestMarkups(objId, { no_pagination: true }, { cancelToken: source.token });
    }
    return new Promise(resolve => resolve({ count: 0, data: [] }));
  };

  function* requestFringes(objId: number): SagaIterator {
    const response: Http.ListResponse<Model.Fringe> = yield call(
      config.services.requestFringes,
      objId,
      { no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(config.actions.responseFringes({ models: response.data }));
  }

  function* requestSubAccountUnits(): SagaIterator {
    const response = yield call(api.getSubAccountUnits, { cancelToken: source.token });
    yield put(config.actions.responseSubAccountUnits(response));
  }

  function* bulkCreateTask(objId: number, e: Table.RowAddEvent<R>, errorMessage: string): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const data = yield select(config.selectData);
      const autoIndex = yield select(config.selectAutoIndex);

      const requestPayload: Http.BulkCreatePayload<P> = tabling.http.createBulkCreatePayload<R, P, C>(
        e.payload,
        config.columns,
        {
          autoIndex,
          rows: data,
          field: "identifier"
        }
      );
      yield put(config.actions.saving(true));
      yield put(config.actions.loadingBudget(true));
      try {
        const response: Http.BudgetBulkCreateResponse<B, M, C> = yield call(
          config.services.bulkCreate,
          objId,
          requestPayload,
          {
            cancelToken: source.token
          }
        );
        /*
        Note: We also have access to the updated Account from the response (as response.data)
        so we could use this to update the overall Account in state.  However, the reducer handles
        that logic pre-request currently, although in the future we may want to use the response
        data as the fallback/source of truth.
        */
        yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
        // Note: The logic in the reducer for activating the placeholder rows with real data relies on the
        // assumption that the models in the response are in the same order as the placeholder numbers.
        const placeholderIds: Table.PlaceholderRowId[] = map(
          Array.isArray(e.payload) ? e.payload : [e.payload],
          (rowAdd: Table.RowAdd<R>) => rowAdd.id
        );
        yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.children }));
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, errorMessage);
        }
      } finally {
        yield put(config.actions.saving(false));
        yield put(config.actions.loadingBudget(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

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
        const response: Http.BudgetBulkResponse<B, C> = yield call(config.services.bulkUpdate, objId, requestPayload, {
          cancelToken: source.token
        });
        /*
        Note: We also have access to the updated Account from the response (as response.data)
        so we could use this to update the overall Account in state.  However, the reducer handles
        that logic pre-request currently, although in the future we may want to use the response
        data as the fallback/source of truth.
        */
        yield put(config.actions.updateBudgetInState({ id: response.budget.id, data: response.budget }));
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, errorMessage);
        }
      } finally {
        yield put(config.actions.loadingBudget(false));
        yield put(config.actions.saving(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* updateMarkupTask(changes: Table.RowChange<R, C, Table.MarkupRow<R>>[]): SagaIterator {
    if (isAuthenticatedConfig(config) && changes.length !== 0) {
      const effects: (StrictEffect | null)[] = map(changes, (ch: Table.RowChange<R, C, Table.MarkupRow<R>>) => {
        const payload = tabling.http.patchPayloadForChange<R, Http.MarkupPayload, C>(ch, config.columns);
        if (!isNil(payload)) {
          return call(api.updateMarkup, tabling.rows.markupId(ch.row.id), payload, {
            cancelToken: source.token
          });
        }
        return null;
      });
      const validEffects: StrictEffect[] = filter(
        effects,
        (eff: StrictEffect | null) => eff !== null
      ) as StrictEffect[];

      yield put(config.actions.saving(true));
      try {
        yield all(validEffects);
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, "There was an error updating the table rows.");
        }
      } finally {
        yield put(config.actions.saving(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* deleteGroups(ids: number[]): SagaIterator {
    yield all(map(ids, (id: number) => call(api.deleteGroup, id, { cancelToken: source.token })));
  }

  function* bulkDeleteModelRows(objId: number, ids: number[]): SagaIterator {
    if (isAuthenticatedConfig(config) && ids.length !== 0) {
      const response: Http.BulkModelResponse<B> = yield call(config.services.bulkDelete, objId, ids, {
        cancelToken: source.token
      });
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.data }));
    }
  }

  function* bulkDeleteMarkupRows(objId: number, ids: number[]): SagaIterator {
    if (isAuthenticatedConfig(config) && ids.length !== 0 && !isNil(config.services.bulkDeleteMarkups)) {
      const response: Http.BudgetBulkResponse<B, C> = yield call(config.services.bulkDeleteMarkups, objId, ids, {
        cancelToken: source.token
      });
      /*
      Note: We also have access to the updated Account from the response (as response.data)
      so we could use this to update the overall Account in state.  However, the reducer handles
      that logic pre-request currently, although in the future we may want to use the response
      data as the fallback/source of truth.
      */
      yield put(config.actions.updateBudgetInState({ id: response.data.id, data: response.budget }));
    }
  }

  function* bulkDeleteRows(objId: number, ids: number[], markupIds?: number[]): SagaIterator {
    // Note: We have do these operations sequentially, since they will both update the Budget in state
    // and we cannot risk running into race conditions.
    yield call(bulkDeleteModelRows, objId, ids);
    if (!isNil(markupIds)) {
      yield call(bulkDeleteMarkupRows, objId, markupIds);
    }
  }

  function* handleRemoveRowFromGroupEvent(action: Redux.Action<Table.RowRemoveFromGroupEvent>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.RowRemoveFromGroupEvent = action.payload;
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(ids, (id: Table.RowId) => ({
          id,
          group: null
        }))
      };
      yield fork(bulkUpdateTask, objId, requestPayload, "There was an error removing the row from the group.", true);
    }
  }

  function* handleAddRowToGroupEvent(action: Redux.Action<Table.RowAddToGroupEvent>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.RowAddToGroupEvent = action.payload;
      const ids = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(ids, (id: Table.RowId) => ({
          id,
          group: e.payload.group
        }))
      };
      yield fork(bulkUpdateTask, objId, requestPayload, "There was an error adding the row to the group.", true);
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddEvent<R> = action.payload;
      yield fork(bulkCreateTask, objId, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent>): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const objId = yield select(config.selectObjId);
      if (!isNil(action.payload) && !isNil(objId)) {
        const e: Table.RowDeleteEvent = action.payload;
        const ids: Table.RowId[] = Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows];
        if (ids.length !== 0) {
          yield put(config.actions.loadingBudget(true));
          yield put(config.actions.saving(true));

          const modelRowIds = filter(ids, (id: Table.RowId) => tabling.typeguards.isModelRowId(id)) as number[];

          const markupRowIds = map(
            filter(ids, (id: Table.RowId) => tabling.typeguards.isMarkupRowId(id)) as Table.MarkupRowId[],
            (id: Table.MarkupRowId) => tabling.rows.markupId(id)
          ) as number[];

          const groupRowIds = map(
            filter(ids, (id: Table.RowId) => tabling.typeguards.isGroupRowId(id)) as Table.GroupRowId[],
            (id: Table.GroupRowId) => tabling.rows.groupId(id)
          );

          try {
            yield all([call(deleteGroups, groupRowIds), call(bulkDeleteRows, objId, modelRowIds, markupRowIds)]);
          } catch (err: unknown) {
            if (!(yield cancelled())) {
              api.handleRequestError(err as Error, "There was an error removing the rows.");
            }
          } finally {
            yield put(config.actions.saving(false));
            yield put(config.actions.loadingBudget(false));
            if (yield cancelled()) {
              source.cancel();
            }
          }
        }
      }
    }
  }

  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, C>>): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const objId = yield select(config.selectObjId);
      if (!isNil(action.payload) && !isNil(objId)) {
        const e: Table.DataChangeEvent<R, C> = action.payload;
        const merged = tabling.events.consolidateTableChange<R, C>(e.payload);

        const markupChanges: Table.RowChange<R, C, Table.MarkupRow<R>>[] = filter(
          merged,
          (value: Table.RowChange<R, C>) => tabling.typeguards.isMarkupRow(value.row)
        ) as Table.RowChange<R, C, Table.MarkupRow<R>>[];

        const dataChanges: Table.RowChange<R, C, Table.ModelRow<R, C>>[] = filter(
          merged,
          (value: Table.RowChange<R, C>) => tabling.typeguards.isModelRow(value.row)
        ) as Table.RowChange<R, C, Table.ModelRow<R, C>>[];

        yield fork(updateMarkupTask, markupChanges);
        if (dataChanges.length !== 0) {
          const requestPayload = tabling.http.createBulkUpdatePayload<R, P, C>(dataChanges, config.columns);
          yield fork(bulkUpdateTask, objId, requestPayload, "There was an error updating the rows.");
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
      dataChange: handleDataChangeEvent
    })
  };
};
