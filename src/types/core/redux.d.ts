declare namespace Redux {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type GenericSelectorFunc<S, T = any> = (state: S) => T;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.AuthenticatedStore, T>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type PublicSelectorFunc<T = any> = GenericSelectorFunc<Application.PublicStore, T>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true
    ? AuthenticatedSelectorFunc<T>
    : PublicSelectorFunc<T>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | PublicSelectorFunc<T>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ActionMap<C extends Table.Context = any> = Record<string, ActionCreator<any> | ContextActionCreator<any, C>>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type InferActionPayload<A> = A extends Action<infer P, any>
    ? P
    : /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    A extends ActionWithContext<infer P, any>
    ? P
    : never;

  type InferAction<CREATOR> = CREATOR extends ContextActionCreator<infer P, infer C>
    ? ActionWithContext<P, C>
    : CREATOR extends ActionCreator<infer P>
    ? Action<P>
    : never;

  type Transformers<S, A extends ActionMap<C>> = {
    [K in keyof A]-?: Reducer<S, InferAction<A[K]>>;
  };

  type _ActionPayload = string | number | boolean | Record<string, unknown>;
  type ActionPayload = _ActionPayload | null | _ActionPayload[];

  type Task<P extends ActionPayload = ActionPayload> = (action: Action<P>) => import("@redux-saga/types").SagaIterator;
  type ContextTask<P extends ActionPayload = ActionPayload, C extends Table.Context = Table.Context> = (
    action: ActionWithContext<P, C>
  ) => import("@redux-saga/types").SagaIterator;

  type TableEventTask<
    E extends Table.ChangeEvent<R, M>,
    R extends Table.RowData,
    M extends Model.RowHttpModel,
    C extends Table.Context = Table.Context
  > = (e: E, context: C) => import("@redux-saga/types").SagaIterator;

  type TableBulkCreateTask<R extends Table.RowData, ARGS extends Array<unknown> = []> = (
    e: Table.RowAddEvent<R>,
    errorMessage: string,
    ...args: ARGS
  ) => import("redux-saga").SagaIterator;

  type TableEventTaskMapObject<
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context
  > = {
    readonly dataChange: TableEventTask<Table.DataChangeEvent<R>, R, M, C>;
    readonly rowAdd: TableEventTask<Table.RowAddEvent<R>, R, M, C>;
    readonly rowInsert: TableEventTask<Table.RowInsertEvent<R>, R, M, C>;
    readonly rowPositionChanged: TableEventTask<Table.RowPositionChangedEvent, R, M, C>;
    readonly rowDelete: TableEventTask<Table.RowDeleteEvent, R, M, C>;
    readonly rowRemoveFromGroup: TableEventTask<Table.RowRemoveFromGroupEvent, R, M, C>;
    readonly rowAddToGroup: TableEventTask<Table.RowAddToGroupEvent, R, M, C>;
    readonly groupAdded: TableEventTask<Table.GroupAddedEvent, R, M, C>;
    readonly groupUpdated: TableEventTask<Table.GroupUpdatedEvent, R, M, C>;
    readonly modelUpdated: TableEventTask<Table.ModelUpdatedEvent<M>, R, M, C>;
    readonly markupAdded: TableEventTask<Table.MarkupAddedEvent, R, M, C>;
    readonly markupUpdated: TableEventTask<Table.MarkupUpdatedEvent, R, M, C>;
  };

  type Reducer<S, A = Action> = import("redux").Reducer<S, A>;
  type ReducersMapObject<S> = {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [K in keyof S]-?: Reducer<S[K], Action<any>>;
  };

  type StoreObj = Record<string, unknown> | boolean | number;

  type Store<S extends Application.Store> = import("redux").Store<S, Action> & {
    readonly reducerManager: ReducerManager<S>;
    readonly injectSaga: (key: string, saga: import("redux-saga").Saga) => boolean;
    readonly ejectSaga: (key: string) => boolean;
    readonly hasSaga: (key: string) => boolean;
  };

  type Dispatch = import("redux").Dispatch<Action>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type Action<P extends ActionPayload = any, T extends string = string> = {
    readonly payload: P;
    readonly type: T;
    readonly isAuthenticated?: boolean | undefined;
  };

  type ActionWithContext<
    P extends ActionPayload = ActionPayload,
    C extends Table.Context = Table.Context
  > = Action<P> & {
    readonly context: C;
  };

  type ActionCreator<P extends ActionPayload> = {
    type: string;
    toString: () => string;
    (p: P): Action<P>;
  };

  interface ContextActionCreator<P extends ActionPayload, C extends Table.Context> {
    type: string;
    toString: () => string;
    (p: P, ctx: C): ActionWithContext<P, C>;
  }

  type AuthenticatedAction<P extends ActionPayload = ActionPayload> = Action<P> & {
    readonly isAuthenticated?: true | undefined;
  };

  type PublicAction<P extends ActionPayload = ActionPayload> = Action<P> & { readonly isAuthenticated: false };

  type TaskConfig<A extends ActionMap> = {
    readonly actions: Omit<A, "request">;
  };

  type ReducerConfig<S, A extends ActionMap> = {
    readonly initialState: S;
    readonly actions: Partial<A>;
  };

  type SagaConfig<T, A extends ActionMap> = {
    readonly tasks: T;
    readonly actions: A;
  };

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: ID; value: boolean };
  type ModelListActionInstance = { id: ID; count: number };

  type ModelListActionStore = ModelListActionInstance[];

  type UpdateActionPayload<T extends Record<string, unknown>, Id extends ID = number> = {
    id: Id;
    data: Partial<T>;
  };

  type TableRequestPayload = { ids: number[] } | null;

  type UpdateOrderingPayload<F extends string = string> = { field: F; order: Http.Order };

  type ClearOnDetail<T extends ActionPayload, C extends Table.Context = Table.Context> = {
    readonly action: ActionCreator<T> | ContextActionCreator<T, C>;
    readonly payload: (payload: T) => boolean;
  };

  type ClearOn<T extends ActionPayload, C extends Table.Context = Table.Context> =
    | ActionCreator<T>
    | ContextActionCreator<T, C>
    | ClearOnDetail<T, C>;

  type ModelDetailResponseStore<T extends Model.HttpModel> = {
    readonly data: T | null;
    readonly loading: boolean;
  };

  type ModelDetailResponseActionMap<M extends Model.HttpModel> = {
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<M | null>;
    readonly updateInState: ActionCreator<UpdateActionPayload<M>>;
  };

  type ListResponseStore<T> = {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  };

  type ListResponseActionMap<T, P extends ActionPayload = ActionPayload> = {
    readonly request: ActionCreator<P>;
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<Http.ListResponse<T>>;
  };

  type ListResponseTaskMap<P extends ActionPayload = ActionPayload> = {
    readonly request: Task<P>;
  };

  type ModelListResponseStore<T extends Model.HttpModel> = ListResponseStore<T>;

  type AuthenticatedModelListResponseStore<T extends Model.HttpModel> = ModelListResponseStore<T> & {
    readonly search: string;
    readonly page: number;
    readonly pageSize: number;
    readonly deleting: ModelListActionStore;
    readonly updating: ModelListActionStore;
    readonly creating: boolean;
    readonly selected: number[];
    readonly ordering: Http.Ordering<string>;
  };

  type ModelListResponseActionMap<M extends Model.HttpModel, P extends ActionPayload = null> = ListResponseActionMap<
    M,
    P
  >;

  type AuthenticatedModelListResponseActionMap<
    M extends Model.HttpModel,
    P extends ActionPayload = null,
    C extends Table.Context = Table.Context
  > = ModelListResponseActionMap<M, P> & {
    readonly updating?: ActionCreator<ModelListActionPayload>;
    readonly creating?: ActionCreator<boolean>;
    readonly removeFromState: ActionCreator<number>;
    readonly deleting?: ActionCreator<ModelListActionPayload>;
    readonly addToState: ActionCreator<M>;
    readonly updateInState: ActionCreator<UpdateActionPayload<M>>;
    readonly setSearch?: ContextActionCreator<string, C>;
    readonly setPagination: ActionCreator<Pagination>;
    readonly updateOrdering?: ActionCreator<UpdateOrderingPayload<string>>;
  };

  type ModelListResponseTaskMap<P extends ActionPayload = null> = {
    readonly request: Task<P>;
  };

  type TableTaskMap<
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context
  > = {
    readonly request?: ContextTask<TableRequestPayload, C>;
    readonly handleChangeEvent: TableEventTask<Table.ChangeEvent<R, M>, R, M, C>;
  };

  type TableActionMap<M extends Model.RowHttpModel = Model.RowHttpModel, C extends Table.Context = Table.Context> = {
    readonly request: ContextActionCreator<TableRequestPayload, C>;
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<Http.TableResponse<M>>;
    readonly setSearch: ContextActionCreator<string, C>;
  };

  type AuthenticatedTableActionMap<
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context
  > = TableActionMap<M, C> & {
    readonly tableChanged: ContextActionCreator<Table.ChangeEvent<R, M>, C>;
    readonly addModelsToState: ActionCreator<AddModelsToTablePayload<M>>;
    readonly updateRowsInState?: ActionCreator<UpdateRowsInTablePayload<R>>;
  };

  type TableStore<D extends Table.RowData> = {
    readonly data: Table.BodyRow<D>[];
    readonly search: string;
    readonly loading: boolean;
  };

  type AddModelsToTablePayload<M extends Model.RowHttpModel> = {
    readonly placeholderIds: Table.PlaceholderRowId[];
    readonly models: M[];
  };

  type UpdateRowPayload<R extends Table.RowData> = {
    readonly data: Partial<R>;
    readonly id: Table.ModelRowId;
  };

  type UpdateRowsInTablePayload<R extends Table.RowData> = SingleOrArray<UpdateRowPayload<R>>;

  type BudgetTableStore<R extends Tables.BudgetRowData> = TableStore<R>;
}
