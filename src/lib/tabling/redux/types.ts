import * as columns from "../columns";
import * as events from "../events";
import * as rows from "../rows";
import * as types from "../types";

export type RowDataSelector<R extends rows.Row> = (
  state: Application.Store,
) => Partial<rows.RowData<R>>;

type TaskConfig<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.ActionCreatorMap<
    Omit<Redux.TableActionPayloadMap<M>, "invalidate">,
    C
  > = Redux.ActionCreatorMap<Omit<Redux.TableActionPayloadMap<M>, "invalidate">, C>,
> = Redux.TaskConfig<A, C> & {
  readonly table: table.TableInstance<R, M>;
  readonly selectStore: (state: Application.Store, ctx: C) => S;
};

export type DefaultValueOnCreate<R extends rows.Row> =
  | rows.RowData<R>[keyof rows.RowData<R>]
  | ((r: Partial<rows.RowData<R>>) => rows.RowData<R>[keyof rows.RowData<R>]);

// type DefaultValueOnUpdate<R extends RowData> = R[keyof R] | ((r: ModelRow<R>) => R[keyof R]);
export type DefaultDataOnCreate<R extends rows.Row> =
  | Partial<rows.RowData<R>>
  | ((r: Partial<rows.RowData<R>>) => Partial<rows.RowData<R>>);

export type DefaultDataOnUpdate<R extends rows.Row> =
  | rows.RowData<R>
  | ((
      r: rows.Row<R, "model">,
      ch: events.RowChangeData<rows.Row<R, "model">>,
    ) => Partial<rows.RowData<R>>);

export type ReducerConfig<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.TableActionCreatorMap<M, C> = Redux.TableActionCreatorMap<M, C>,
> = Omit<TaskConfig<R, M, S, C, A>, "table" | "selectStore"> & {
  readonly initialState: S;
  readonly columns: columns.ModelColumn<R, M>[];
  readonly defaultDataOnCreate?: DefaultDataOnCreate<R>;
  readonly defaultDataOnUpdate?: DefaultDataOnUpdate<R>;
  readonly getModelRowChildren?: (m: M) => number[];
};

export type AuthenticatedReducerConfig<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Redux.AuthenticatedTableActionCreatorMap<
    R,
    M,
    C
  > = Redux.AuthenticatedTableActionCreatorMap<R, M, C>,
> = ReducerConfig<R, M, S, C, A>;

export type PublicSagaConfig<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends PickOptional<Redux.TableActionCreatorMap<M, C>, "request"> = PickOptional<
    Redux.TableActionCreatorMap<M, C>,
    "request"
  >,
  T extends Optional<Redux.TableTaskMap<C>, "request"> = Optional<Redux.TableTaskMap<C>, "request">,
> = Redux.SagaConfig<T, A, C> & {
  readonly selectStore: (state: Application.Store, ctx: C) => S;
};

export type AuthenticatedSagaConfig<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
  A extends Optional<
    Pick<Redux.AuthenticatedTableActionCreatorMap<R, M, C>, "request" | "handleEvent">,
    "request"
  > = Optional<
    Pick<Redux.AuthenticatedTableActionCreatorMap<R, M, C>, "request" | "handleEvent">,
    "request"
  >,
  T extends Optional<
    Pick<Redux.AuthenticatedTableTaskMap<R, C>, "request" | "handleChangeEvent">,
    "request"
  > = Optional<
    Pick<Redux.AuthenticatedTableTaskMap<R, C>, "request" | "handleChangeEvent">,
    "request"
  >,
> = Redux.SagaConfig<T, A, C> & {
  readonly selectStore: (state: Application.Store, ctx: C) => S;
};
