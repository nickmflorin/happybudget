declare namespace Redux {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type GenericSelectorFunc<S, T = any> = (state: S) => T;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type SelectorFunc<T = any> = GenericSelectorFunc<Application.Store, T>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ActionMap<C extends Table.Context = any> = Record<string, ActionCreator<any> | TableActionCreator<any, C>>;

  type InferAction<CREATOR> = CREATOR extends TableActionCreator<infer P, infer C>
    ? TableAction<P, C>
    : CREATOR extends ActionCreator<infer P>
    ? Action<P>
    : never;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ActionPayload = any;

  type Task<P extends ActionPayload = ActionPayload> = (action: Action<P>) => import("@redux-saga/types").SagaIterator;
  type ContextTask<P extends ActionPayload = ActionPayload, C extends Table.Context = Table.Context> = (
    action: TableAction<P, C>
  ) => import("@redux-saga/types").SagaIterator;

  type ActionContext = {
    readonly publicTokenId?: string;
    readonly errorMessage?: string;
  };

  type WithActionContext<C extends Record<string, unknown>> = C & ActionContext;

  type TableChangeEventTask<
    E extends Table.ChangeEvent<R>,
    R extends Table.RowData,
    C extends Table.Context = Table.Context
  > = (e: E, context: WithActionContext<C>) => import("@redux-saga/types").SagaIterator;

  type TableChangeEventTaskMapObject<R extends Table.RowData, C extends Table.Context = Table.Context> = {
    readonly dataChange: TableChangeEventTask<Table.DataChangeEvent<R>, R, C>;
    readonly rowAdd: TableChangeEventTask<Table.RowAddEvent<R>, R, C>;
    readonly groupAdd: TableChangeEventTask<Table.GroupAddEvent, R, C>;
    readonly groupUpdate: TableChangeEventTask<Table.GroupUpdateEvent, R, C>;
    readonly markupAdd: TableChangeEventTask<Table.MarkupAddEvent, R, C>;
    readonly markupUpdate: TableChangeEventTask<Table.MarkupUpdateEvent, R, C>;
    readonly rowInsert: TableChangeEventTask<Table.RowInsertEvent<R>, R, C>;
    readonly rowPositionChanged: TableChangeEventTask<Table.RowPositionChangedEvent, R, C>;
    readonly rowDelete: TableChangeEventTask<Table.RowDeleteEvent, R, C>;
    readonly rowRemoveFromGroup: TableChangeEventTask<Table.RowRemoveFromGroupEvent, R, C>;
    readonly rowAddToGroup: TableChangeEventTask<Table.RowAddToGroupEvent, R, C>;
  };

  type Reducer<S, A = Action> = import("redux").Reducer<S, A>;
  type ReducerWithDefinedState<S, A = Action> = (s: S, a: A) => S;

  type ReducersMapObject<S> = {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    [K in keyof S]-?: Reducer<S[K], any>;
  };

  type StoreObj = Record<string, unknown> | boolean | number;

  type Store<S extends Application.Store> = import("redux").Store<S, Action> & {
    readonly injectSaga: (key: string, saga: import("redux-saga").Saga) => boolean;
    readonly ejectSaga: (key: string) => boolean;
    readonly hasSaga: (key: string) => boolean;
  };

  type Dispatch = import("redux").Dispatch<Action>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type BasicAction<P extends ActionPayload = any, T extends string = string> = {
    readonly payload: P;
    readonly type: T;
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type Action<P extends ActionPayload = any, C extends ActionContext = ActionContext> = BasicAction<P> & {
    readonly context: C;
    readonly user?: Model.User | null;
  };

  type TableActionContext<C extends Table.Context = Table.Context> = WithActionContext<C>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type TableAction<P extends ActionPayload = any, C extends Table.Context = Table.Context> = Action<
    P,
    WithActionContext<C>
  >;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ActionCreator<P extends ActionPayload = any> = {
    type: string;
    toString: () => string;
    (p: P, ctx?: Pick<ActionContext, "errorMessage">): Action<P>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type TableActionCreator<P extends ActionPayload = any, C extends Table.Context = Table.Context> = {
    type: string;
    toString: () => string;
    (p: P, ctx: Omit<WithActionContext<C>, "publicTokenId">): Action<P, WithActionContext<C>>;
  };

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

  type UpdateModelPayload<T extends Model.Model> = {
    id: T["id"];
    data: Partial<T>;
  };

  type HttpUpdateModelPayload<T extends Model.Model, P> = {
    id: T["id"];
    data: Partial<P>;
  };

  type TableRequestPayload = { ids: number[] } | null;

  type UpdateOrderingPayload<F extends string = string> = { field: F; order: Http.Order };

  type ClearOnDetail<T extends ActionPayload, C extends Table.Context = Table.Context> = {
    readonly action: ActionCreator<T> | TableActionCreator<T, C>;
    readonly payload: (payload: T) => boolean;
  };

  type ClearOn<T extends ActionPayload, C extends Table.Context = Table.Context> =
    | ActionCreator<T>
    | TableActionCreator<T, C>
    | ClearOnDetail<T, C>;

  type ModelDetailResponseStore<T extends Model.HttpModel> = {
    readonly data: T | null;
    readonly loading: boolean;
  };

  type ModelDetailResponseActionMap<M extends Model.HttpModel> = {
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<M | null>;
    readonly updateInState: ActionCreator<UpdateModelPayload<M>>;
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
    readonly updateInState: ActionCreator<UpdateModelPayload<M>>;
    readonly setSearch?: TableActionCreator<string, C>;
    readonly setPagination: ActionCreator<Pagination>;
    readonly updateOrdering?: ActionCreator<UpdateOrderingPayload<string>>;
  };

  type ModelListResponseTaskMap<P extends ActionPayload = null> = {
    readonly request: Task<P>;
  };

  type TableTaskMap<C extends Table.Context = Table.Context> = {
    readonly request: ContextTask<TableRequestPayload, C>;
  };

  type AuthenticatedTableTaskMap<R extends Table.RowData, C extends Table.Context = Table.Context> = TableTaskMap<C> & {
    readonly handleChangeEvent: TableChangeEventTask<Table.ChangeEvent<R>, R, C>;
  };

  type TableTaskMapWithRequest<C extends Table.Context = Table.Context> = {
    readonly request: ContextTask<TableRequestPayload, C>;
  };

  type TableTaskMapWithRequestOptional<
    T extends TableTaskMapWithRequest<C>,
    C extends Table.Context = Table.Context
  > = Omit<T, "request"> & { readonly request?: T["request"] };

  type TableActionMap<M extends Model.RowHttpModel = Model.RowHttpModel, C extends Table.Context = Table.Context> = {
    readonly request: TableActionCreator<TableRequestPayload, C>;
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<Http.TableResponse<M>>;
    readonly setSearch: TableActionCreator<string, C>;
  };

  type AuthenticatedTableActionMap<
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context
  > = TableActionMap<M, C> & {
    readonly handleEvent: TableActionCreator<Table.Event<R, M>, C>;
  };

  type TableActionMapWithRequest<C extends Table.Context = Table.Context> = {
    readonly request: TableActionCreator<TableRequestPayload, C>;
  };

  type TableActionMapWithRequestOptional<
    T extends TableActionMapWithRequest<C>,
    C extends Table.Context = Table.Context
  > = Omit<T, "request"> & { readonly request?: T["request"] };

  type TableStore<D extends Table.RowData = Table.RowData> = {
    readonly data: Table.BodyRow<D>[];
    readonly search: string;
    readonly loading: boolean;
    readonly eventHistory: Table.ChangeEventHistory<D>;
    readonly eventIndex: number;
  };

  type BudgetTableStore<R extends Tables.BudgetRowData> = TableStore<R>;
}
