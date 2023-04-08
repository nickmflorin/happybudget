import { SagaIterator } from "redux-saga";
import { Optional } from "utility-types";

import { model, tabling } from "lib";

import * as errors from "../../errors";

import * as actions from "./actions";
import * as application from "./application";
import * as sagas from "./sagas";
import * as store from "./store";
import * as tasks from "./tasks";

/*------------------------------------------ Store ---------------------------------------------- */
export type TableStore<R extends tabling.Row = tabling.Row> = {
  /* Note: Even though the TableStore object is very analogous to the ApiModelListStore object, the
     `count` is not applicable - because requests for the models that comprise the data used to
     generate tables will always return all of the relevant models as pagination is not currently
     supported in tables. */
  readonly data: tabling.RowSubType<R, tabling.BodyRowType>[];
  /* We do not need to maintain a history of the previous search, as it relates to making decisions
     about whether or not previously requested results can be used, because searching is performed
     client side for the tables via AGGrid, at least currently.  Query strings currently are not
     applicable for requests to obtain table data (at least query strings that would be applicable
     in making decisions about whether or not previously requested results can be used). */
  readonly search: string;
  readonly loading: boolean;
  /**
   * A history of user submitted events that alter the data in the table, and the current index of
   * the event history that represents the current state of the table.  Used for undo/redo behavior.
   */
  readonly eventHistory: tabling.ChangeEventHistory<tabling.RowSubType<R, tabling.EditableRowType>>;
  readonly eventIndex: number;
  /**
   * Indicates whether or not the data in the store is the result of an API request versus the
   * initial state.
   *
   * Unlike the {@link ApiModelDetailStore}, when dealing with list responses we cannot simply check
   * if the data was received already from an API request based on a null/non-null value (or
   * empty/not-empty value) because the data received from the API may in fact be an empty list.
   */
  readonly responseWasReceived: boolean;
  /**
   * Informs the store that the current results should be invalidated and the next request to
   * obtain the data should be performed regardless of whether or not the data is already in the
   * store.
   */
  readonly invalidated: boolean;
  /**
   * The error that occurred (if any) during the previous API request to populate the store.  Used
   * when determining whether or not the previously requested results can be reused.
   */
  readonly error: errors.HttpError | null;
};

export type BudgetTableStore<R extends tabling.Row<model.BudgetRowData>> = TableStore<R>;

export type ActualTableStore = TableStore<model.ActualRow> & {
  readonly owners: store.AuthenticatedApiModelListStore<model.ActualOwner>;
};
export type FringeTableStore = TableStore<model.FringeRow>;
export type SubAccountTableStore = BudgetTableStore<model.SubAccountRow>;
export type ContactTableStore = TableStore<model.ContactRow>;
export type AccountTableStore = BudgetTableStore<model.AccountRow>;

export type SuccessfulTableResponse<M extends model.RowTypedApiModel = model.RowTypedApiModel> = {
  readonly models: M[];
  readonly groups?: model.Group[];
  readonly markups?: model.Markup[];
  readonly error?: undefined;
};

export type ErrorTableResponse = {
  readonly error: errors.HttpError;
};

export type TableResponse<M extends model.RowTypedApiModel = model.RowTypedApiModel> =
  | ErrorTableResponse
  | SuccessfulTableResponse<M>;

/*------------------------------------------ Actions -------------------------------------------- */
export type TableRequestActionPayload = { ids: number[] } | actions.RequestActionPayload;

export type TableRequestAction<C extends actions.ActionContext = actions.ActionContext> =
  actions.Action<TableRequestActionPayload, C>;

export type TableRequestActionCreator<C extends actions.ActionContext = actions.ActionContext> =
  actions.ActionCreator<TableRequestActionPayload, C>;

export type TableActionPayloadMap<M extends model.RowTypedApiModel = model.RowTypedApiModel> = {
  readonly request: TableRequestActionPayload;
  readonly loading: boolean;
  readonly response: TableResponse<M>;
  readonly setSearch: string;
  readonly invalidate?: null;
};

export type AuthenticatedTableActionPayloadMap<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = TableActionPayloadMap<M> & {
  readonly handleEvent: tabling.AnyTableEvent<R>;
};

/*----------------------------------------- Selectors ------------------------------------------- */

export type RowDataSelector<R extends tabling.Row> = (
  state: application.ApplicationStore,
) => Partial<tabling.RowData<R>>;

/*------------------------------------------- Tasks --------------------------------------------- */
export type TableChangeEventTask<
  E extends tabling.ChangeEventId,
  R extends tabling.Row,
  C extends actions.ActionContext = actions.ActionContext,
> = (e: tabling.ChangeEvent<E, R>, context: C) => SagaIterator;

export type TableChangeEventTaskMapObject<
  R extends tabling.Row,
  C extends actions.ActionContext = actions.ActionContext,
> = {
  [key in tabling.ChangeEventId]: TableChangeEventTask<key, R, C>;
};

export type TableTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request:
    | tasks.Task<actions.Action<TableRequestActionPayload, C>>
    | tasks.Task<actions.Action<null, C>>;
};

export type AuthenticatedTableTaskMap<
  R extends tabling.Row,
  C extends actions.ActionContext = actions.ActionContext,
> = TableTaskMap<C> & {
  readonly handleChangeEvent: TableChangeEventTask<tabling.ChangeEventId, R, C>;
};

export type TableTaskConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends TableStore<R> = TableStore<R>,
  C extends actions.ActionContext = actions.ActionContext,
  MP extends Omit<TableActionPayloadMap, "invalidate"> = Omit<TableActionPayloadMap, "invalidate">,
  A extends actions.ActionCreatorMap<MP, C> = actions.ActionCreatorMap<MP, C>,
> = tasks.TaskConfig<MP, C, A> & {
  readonly table: tabling.TableInstance<R, M>;
  readonly selectStore: (state: application.ApplicationStore, ctx: C) => S;
};

export type DefaultValueOnCreate<R extends tabling.Row> =
  | tabling.RowData<R>[keyof tabling.RowData<R>]
  | ((r: Partial<tabling.RowData<R>>) => tabling.RowData<R>[keyof tabling.RowData<R>]);

// type DefaultValueOnUpdate<R extends RowData> = R[keyof R] | ((r: ModelRow<R>) => R[keyof R]);
export type DefaultDataOnCreate<R extends tabling.Row> =
  | Partial<tabling.RowData<R>>
  | ((r: Partial<tabling.RowData<R>>) => Partial<tabling.RowData<R>>);

export type DefaultDataOnUpdate<R extends tabling.Row> =
  | tabling.RowData<R>
  | ((
      r: tabling.RowSubType<R, "model">,
      ch: tabling.RowChangeData<tabling.RowSubType<R, "model">>,
    ) => Partial<tabling.RowData<R>>);

/*------------------------------------------ Reducers ------------------------------------------- */
export type TableReducerConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends TableStore<R> = TableStore<R>,
  C extends actions.ActionContext = actions.ActionContext,
  MP extends Omit<TableActionPayloadMap, "invalidate"> = Omit<TableActionPayloadMap, "invalidate">,
  A extends actions.ActionCreatorMap<MP, C> = actions.ActionCreatorMap<MP, C>,
> = Omit<TableTaskConfig<R, M, S, C, MP, A>, "table" | "selectStore"> & {
  readonly initialState: S;
  readonly columns: tabling.ModelColumn<R, M>[];
  readonly defaultDataOnCreate?: DefaultDataOnCreate<R>;
  readonly defaultDataOnUpdate?: DefaultDataOnUpdate<R>;
  readonly getModelRowChildren?: (m: M) => number[];
};

export type AuthenticatedTableReducerConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends TableStore<R> = TableStore<R>,
  C extends actions.ActionContext = actions.ActionContext,
  MP extends Omit<AuthenticatedTableActionPayloadMap<R, M>, "invalidate"> = Omit<
    AuthenticatedTableActionPayloadMap<R, M>,
    "invalidate"
  >,
  A extends actions.ActionCreatorMap<MP, C> = actions.ActionCreatorMap<MP, C>,
> = TableReducerConfig<R, M, S, C, MP, A>;

/*------------------------------------------ Sagas ---------------------------------------------- */
export type PublicTableSagaConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends TableStore<R> = TableStore<R>,
  C extends actions.ActionContext = actions.ActionContext,
  MP extends Optional<Pick<TableActionPayloadMap<M>, "request">, "request"> = Optional<
    Pick<TableActionPayloadMap<M>, "request">,
    "request"
  >,
  T extends Optional<TableTaskMap<C>, "request"> = Optional<TableTaskMap<C>, "request">,
> = sagas.SagaConfig<T, MP, C> & {
  readonly selectStore: (state: application.ApplicationStore, ctx: C) => S;
};

export type AuthenticatedTableSagaConfig<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends TableStore<R> = TableStore<R>,
  C extends actions.ActionContext = actions.ActionContext,
  MP extends Optional<
    Pick<AuthenticatedTableActionPayloadMap<R, M>, "request" | "handleEvent">,
    "request"
  > = Optional<
    Pick<AuthenticatedTableActionPayloadMap<R, M>, "request" | "handleEvent">,
    "request"
  >,
  T extends Optional<
    Pick<AuthenticatedTableTaskMap<R, C>, "request" | "handleChangeEvent">,
    "request"
  > = Optional<Pick<AuthenticatedTableTaskMap<R, C>, "request" | "handleChangeEvent">, "request">,
> = sagas.SagaConfig<T, MP, C> & {
  readonly selectStore: (state: application.ApplicationStore, ctx: C) => S;
};
