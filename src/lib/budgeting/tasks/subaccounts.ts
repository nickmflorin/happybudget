import axios from "axios";
import { SagaIterator } from "redux-saga";
import { call, put, select, fork, cancelled, all } from "redux-saga/effects";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import * as contactsTasks from "store/tasks/contacts";
import * as tabling from "../../tabling";
import * as util from "../../util";

type R = Tables.SubAccountRowData;
type C = Model.SubAccount;
type P = Http.SubAccountPayload;

export type SubAccountsTableServiceSet = {
  request: (id: ID, query: Http.ListQuery, options: Http.RequestOptions) => Promise<Http.ListResponse<C>>;
  requestGroups: (
    id: ID,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.BudgetGroup>>;
  requestFringes: (
    id: ID,
    query: Http.ListQuery,
    options: Http.RequestOptions
  ) => Promise<Http.ListResponse<Model.Fringe>>;
};

export type AuthenticatedSubAccountsTableServiceSet<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = SubAccountsTableServiceSet & {
  bulkDelete: (id: ID, ids: ID[], options: Http.RequestOptions) => Promise<Http.BudgetBulkResponse<B, M>>;
  bulkUpdate: (
    id: ID,
    data: Http.BulkUpdatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkResponse<B, M>>;
  bulkCreate: (
    id: ID,
    p: Http.BulkCreatePayload<P>,
    options: Http.RequestOptions
  ) => Promise<Http.BudgetBulkCreateResponse<B, M, C>>;
};

export type SubAccountsTableActionMap = Redux.TableActionMap<C, Model.BudgetGroup> & {
  readonly loadingBudget: boolean;
  readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
  readonly responseFringes: Http.TableResponse<Model.Fringe>;
  readonly responseFringeColors: Http.ListResponse<string>;
};

export type AuthenticatedSubAccountsTableActionMap<B extends Model.Template | Model.Budget> =
  Redux.AuthenticatedTableActionMap<R, C, Model.BudgetGroup> & {
    readonly loadingBudget: boolean;
    readonly tableChanged: Table.ChangeEvent<R, C>;
    readonly updateBudgetInState: Redux.UpdateActionPayload<B>;
    readonly responseSubAccountUnits: Http.ListResponse<Model.Tag>;
    readonly responseFringes: Http.TableResponse<Model.Fringe>;
  };

export type SubAccountsTableTaskConfig = Redux.TableTaskConfig<R, C, Model.BudgetGroup, SubAccountsTableActionMap> & {
  readonly services: SubAccountsTableServiceSet;
  readonly selectObjId: (state: Application.Authenticated.Store) => ID | null;
};

export type AuthenticatedSubAccountsTableTaskConfig<
  M extends Model.Account | Model.SubAccount,
  B extends Model.Template | Model.Budget
> = Redux.TableTaskConfig<R, C, Model.BudgetGroup, AuthenticatedSubAccountsTableActionMap<B>> & {
  readonly services: AuthenticatedSubAccountsTableServiceSet<M, B>;
  readonly selectObjId: (state: Application.Authenticated.Store) => ID | null;
  readonly selectData: (state: Application.Authenticated.Store) => Table.Row<R, C>[];
  readonly selectAutoIndex: (state: Application.Authenticated.Store) => boolean;
};

const isAuthenticatedConfig = <M extends Model.Account | Model.SubAccount, B extends Model.Template | Model.Budget>(
  c: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): c is AuthenticatedSubAccountsTableTaskConfig<M, B> => {
  return (c as AuthenticatedSubAccountsTableTaskConfig<M, B>).services.bulkCreate !== undefined;
};

/* eslint-disable indent */
export const createTableTaskSet = <M extends Model.Account | Model.SubAccount, B extends Model.Budget | Model.Template>(
  config: SubAccountsTableTaskConfig | AuthenticatedSubAccountsTableTaskConfig<M, B>
): Redux.TaskMapObject<Redux.TableTaskMapWithGroups<R, C>> => {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  function* request(action: Redux.Action<null>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId)) {
      yield put(config.actions.loading(true));
      try {
        yield fork(contactsTasks.request, action);
        yield fork(requestSubAccountUnits);
        yield fork(requestFringes, objId);
        const [models, groups]: [Http.ListResponse<C>, Http.ListResponse<Model.BudgetGroup>] = yield all([
          call(requestSubAccounts, objId),
          call(requestGroups, objId)
        ]);
        yield put(config.actions.response({ models, groups }));
        if (models.data.length === 0) {
          const event: Table.RowAddEvent<R, C> = {
            type: "rowAdd",
            payload: [
              { id: `placeholder-${util.generateRandomNumericId()}`, data: {} },
              { id: `placeholder-${util.generateRandomNumericId()}`, data: {} }
            ]
          };
          // Tag the event as artificial so it does not re-trigger this same task.
          if (isAuthenticatedConfig(config)) {
            yield put({ type: config.actions.tableChanged.toString(), payload: { ...event, artificial: true } });
            yield fork(bulkCreateTask, objId, event, "There was an error creating the rows.");
          }
        }
      } catch (e: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(e as Error, "There was an error retrieving the table data.");
          yield put(config.actions.response({ models: { count: 0, data: [] }, groups: { count: 0, data: [] } }));
        }
      } finally {
        yield put(config.actions.loading(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  const requestSubAccounts = (objId: ID): Promise<Http.ListResponse<C>> =>
    config.services.request(objId, { no_pagination: true }, { cancelToken: source.token });

  const requestGroups = (objId: ID): Promise<Http.ListResponse<Model.BudgetGroup>> =>
    config.services.requestGroups(objId, { no_pagination: true }, { cancelToken: source.token });

  function* requestFringes(objId: ID): SagaIterator {
    const response: Http.ListResponse<Model.Fringe> = yield call(
      config.services.requestFringes,
      objId,
      { no_pagination: true },
      { cancelToken: source.token }
    );
    yield put(config.actions.responseFringes({ models: response, groups: { count: 0, data: [] } }));
  }

  function* requestSubAccountUnits(): SagaIterator {
    const response = yield call(api.getSubAccountUnits, { cancelToken: source.token });
    yield put(config.actions.responseSubAccountUnits(response));
  }

  function* bulkCreateTask(objId: ID, e: Table.RowAddEvent<R, C>, errorMessage: string): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      // ToDo: Factor in auto indexing into the placeholder row data.
      yield put(config.actions.addPlaceholdersToState(Array.isArray(e.payload) ? e.payload : [e.payload]));

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
      if (tabling.events.eventWarrantsRecalculation(e)) {
        yield put(config.actions.loadingBudget(true));
      }
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
        // assumption that the models in the response are in the same order as the placeholder IDs.
        const placeholderIds: Table.PlaceholderRowId[] = map(
          Array.isArray(e.payload) ? e.payload : [e.payload],
          (rowAdd: Table.RowAdd<R, C>) => rowAdd.id
        );
        yield put(config.actions.addModelsToState({ placeholderIds: placeholderIds, models: response.children }));
      } catch (err: unknown) {
        if (!(yield cancelled())) {
          api.handleRequestError(err as Error, errorMessage);
        }
      } finally {
        yield put(config.actions.saving(false));
        if (tabling.events.eventWarrantsRecalculation(e)) {
          yield put(config.actions.loadingBudget(false));
        }
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* bulkUpdateTask(
    objId: ID,
    e: Table.ChangeEvent<R, C>,
    requestPayload: Http.BulkUpdatePayload<P>,
    errorMessage: string
  ): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      yield put(config.actions.saving(true));
      if (!tabling.typeguards.isGroupEvent(e) && tabling.events.eventWarrantsRecalculation(e)) {
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
        if (!tabling.typeguards.isGroupEvent(e) && tabling.events.eventWarrantsRecalculation(e)) {
          yield put(config.actions.loadingBudget(false));
        }
        yield put(config.actions.saving(false));
        if (yield cancelled()) {
          source.cancel();
        }
      }
    }
  }

  function* bulkDeleteTask(objId: ID, e: Table.RowDeleteEvent<R, C>, errorMessage: string): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      const rows: Table.ModelRow<R, C>[] = filter(
        Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows],
        (r: Table.DataRow<R, C>) => tabling.typeguards.isModelRow(r)
      ) as Table.ModelRow<R, C>[];
      if (rows.length !== 0) {
        const ids = map(rows, (row: Table.ModelRow<R, C>) => row.id);

        yield put(config.actions.saving(true));
        if (tabling.events.eventWarrantsRecalculation<R, C>(e)) {
          yield put(config.actions.loadingBudget(true));
        }
        try {
          const response: Http.BudgetBulkResponse<B, C> = yield call(config.services.bulkDelete, objId, ids, {
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
          yield put(config.actions.saving(false));
          if (tabling.events.eventWarrantsRecalculation(e)) {
            yield put(config.actions.loadingBudget(false));
          }
          if (yield cancelled()) {
            source.cancel();
          }
        }
      }
    }
  }

  function* handleRemoveRowFromGroupEvent(action: Redux.Action<Table.RowRemoveFromGroupEvent<R, C>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.RowRemoveFromGroupEvent<R, C> = action.payload;
      const rows: Table.ModelRow<R, C>[] = filter(
        Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows],
        (r: Table.DataRow<R, C>) => tabling.typeguards.isModelRow(r)
      ) as Table.ModelRow<R, C>[];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(rows, (row: Table.ModelRow<R, C>) => ({
          id: row.id,
          group: null
        }))
      };
      yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error removing the row from the group.");
    }
  }

  function* handleAddRowToGroupEvent(action: Redux.Action<Table.RowAddToGroupEvent<R, C>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.RowAddToGroupEvent<R, C> = action.payload;
      const rows: Table.ModelRow<R, C>[] = filter(
        Array.isArray(e.payload.rows) ? e.payload.rows : [e.payload.rows],
        (r: Table.DataRow<R, C>) => tabling.typeguards.isModelRow(r)
      ) as Table.ModelRow<R, C>[];
      const requestPayload: Http.BulkUpdatePayload<P> = {
        data: map(rows, (row: Table.ModelRow<R, C>) => ({
          id: row.id,
          group: e.payload.group
        }))
      };
      yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error adding the row to the group.");
    }
  }

  function* handleDeleteGroupEvent(action: Redux.Action<Table.GroupDeleteEvent>): SagaIterator {
    if (isAuthenticatedConfig(config)) {
      if (!isNil(action.payload)) {
        const e: Table.GroupDeleteEvent = action.payload;
        yield put(config.actions.saving(true));
        try {
          yield call(api.deleteGroup, e.payload, { cancelToken: source.token });
        } catch (err: unknown) {
          if (!(yield cancelled())) {
            api.handleRequestError(err as Error, "There was an error deleting the group.");
          }
        } finally {
          yield put(config.actions.saving(false));
          if (yield cancelled()) {
            source.cancel();
          }
        }
      }
    }
  }

  function* handleRowAddEvent(action: Redux.Action<Table.RowAddEvent<R, C>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(objId) && !isNil(action.payload)) {
      const e: Table.RowAddEvent<R, C> = action.payload;
      yield fork(bulkCreateTask, objId, e, "There was an error creating the rows.");
    }
  }

  function* handleRowDeleteEvent(action: Redux.Action<Table.RowDeleteEvent<R, C>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.RowDeleteEvent<R, C> = action.payload;
      yield fork(bulkDeleteTask, objId, e, "There was an error deleting the rows.");
    }
  }

  // ToDo: This is an EDGE case, but we need to do it for smooth operation - we need to filter out the
  // changes that correspond to placeholder rows.
  function* handleDataChangeEvent(action: Redux.Action<Table.DataChangeEvent<R, C>>): SagaIterator {
    const objId = yield select(config.selectObjId);
    if (!isNil(action.payload) && !isNil(objId)) {
      const e: Table.DataChangeEvent<R, C> = action.payload;
      const merged = tabling.events.consolidateTableChange<R, C>(e.payload);
      if (merged.length !== 0) {
        const requestPayload = tabling.http.createBulkUpdatePayload<R, P, C>(merged, config.columns);
        yield fork(bulkUpdateTask, objId, e, requestPayload, "There was an error updating the rows.");
      }
    }
  }

  return {
    handleRemoveRowFromGroupEvent,
    handleAddRowToGroupEvent,
    handleDeleteGroupEvent,
    handleRowAddEvent,
    handleRowDeleteEvent,
    handleDataChangeEvent,
    request
  };
};
