declare namespace Redux {
  type GenericSelectorFunc<S, T = any> = (state: S) => T;
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Authenticated.Store, T>;
  type UnauthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Unauthenticated.Store, T>;

  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true
    ? AuthenticatedSelectorFunc<T>
    : UnauthenticatedSelectorFunc<T>;

  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | UnauthenticatedSelectorFunc<T>;

  type AsyncId = `async-${string}`;

  /* eslint-disable-next-line no-unused-vars */
  type AsyncStores<S = any> = { [key in AsyncId]: S };

  type Transformers<S = any, A = any> = {
    /* eslint-disable-next-line no-unused-vars */
    [K in keyof A]-?: Reducer<S>;
  };

  type Task<P = any> = (action: Action<P>) => import("@redux-saga/types").SagaIterator;
  type ContextTask<P = any, C = any> = (action: ActionWithContext<P, C>) => import("@redux-saga/types").SagaIterator;

  type TableEventTask<
    E extends Table.ChangeEvent<R, M>,
    R extends Table.RowData = any,
    M extends Model.RowHttpModel = any,
    C = any
  > = (e: E, context: C) => import("@redux-saga/types").SagaIterator;

  type TableBulkCreateTask<R extends Table.RowData = any, ARGS extends any[] = []> = (
    e: Table.RowAddEvent<R>,
    errorMessage: string,
    ...args: ARGS
  ) => import("redux-saga").SagaIterator;

  interface TableEventTaskMapObject<R extends Table.RowData = any, M extends Model.RowHttpModel = any, C = any> {
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
  }

  type Reducer<S, A = Action> = import("redux").Reducer<S, A>;
  type ReducersMapObject<S = any> = {
    [K in keyof S]-?: Reducer<S[K]>;
  };

  type ReducersWithAsyncMapObject<S = any> = ReducersMapObject<S> & {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    [K in AsyncId]: Reducer<any>;
  };

  type ReducerManager<S extends Application.Store> = {
    readonly getReducerMap: () => ReducersWithAsyncMapObject<S>;
    readonly reduce: (state: S | undefined, action: Action) => S;
    readonly injectReducer: (key: Table.AsyncId, reducer: Reducer<any>) => void;
    readonly ejectReducer: (key: Table.AsyncId) => void;
  };

  type StoreObj = Record<string, any> | boolean | number;

  type Store<S extends Application.Store> = import("redux").Store<S, Action> & {
    readonly reducerManager: ReducerManager<S>;
    readonly injectSaga: (key: string, saga: import("redux-saga").Saga<any[]>) => boolean;
    readonly ejectSaga: (key: string) => boolean;
  };

  type Dispatch = import("redux").Dispatch<Action>;

  interface Action<P = any, T extends string = string> {
    readonly payload: P;
    readonly type: T;
    readonly isAuthenticated?: boolean | undefined;
    readonly toString: () => string;
  }

  interface ActionWithContext<P = any, C = any, T extends string = string> extends Action<P, T> {
    readonly context: C;
  }

  type ActionCreator<P> = import("@reduxjs/toolkit").ActionCreatorWithPayload<P>;
  type ContextActionCreator<P, C> = (p: P, ctx: C) => ActionWithContext<P, C>;

  type AuthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated?: true | undefined };

  type UnauthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated: false };

  type ModelLookup<M extends Model.Model> = ID | ((m: M) => boolean);

  type FindModelOptions = {
    readonly warnIfMissing?: boolean;
    readonly name?: string;
  };

  type TaskConfig<A> = {
    readonly actions: Omit<A, "request">;
  };

  type ReducerConfig<S, A> = {
    readonly initialState: S;
    readonly actions: A;
  };

  type SagaConfig<T, A> = {
    readonly tasks: T;
    readonly actions: A;
  };

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: ID; value: boolean };
  type ModelListActionInstance = { id: ID; count: number };

  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateActionPayload<T extends object, Id extends ID = number> {
    id: Id;
    data: Partial<T>;
  }

  type TableRequestPayload = { ids: number[] } | null;

  type UpdateOrderingPayload<F extends string = string> = { field: F; order: Http.Order };

  type ClearOnDetail<T, C = any> = {
    readonly action: ActionCreator<T> | ContextActionCreator<T, C>;
    readonly payload: (payload: T) => boolean;
  };

  type ClearOn<T, C = any> = ActionCreator<T> | ContextActionCreator<T, C> | ClearOnDetail<T, C>;

  interface ModelDetailResponseStore<T extends Model.HttpModel> {
    readonly data: T | null;
    readonly loading: boolean;
  }

  interface ModelDetailResponseActionMap<M extends Model.HttpModel> {
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<M | null>;
    readonly updateInState: ActionCreator<UpdateActionPayload<M>>;
  }

  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  type ListResponseActionMap<T, P = any> = {
    readonly request: ActionCreator<P>;
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<Http.ListResponse<T>>;
  };

  interface ListResponseTaskMap<P = any> {
    readonly request: Task<P>;
  }

  interface ModelListResponseStore<T extends Model.HttpModel> extends ListResponseStore<T> {}

  interface AuthenticatedModelListResponseStore<T extends Model.HttpModel> extends ModelListResponseStore<T> {
    readonly search: string;
    readonly page: number;
    readonly pageSize: number;
    readonly deleting: ModelListActionStore;
    readonly updating: ModelListActionStore;
    readonly creating: boolean;
    readonly selected: number[];
    readonly ordering: Http.Ordering<string>;
  }

  type ModelListResponseActionMap<M extends Model.HttpModel, P = any> = ListResponseActionMap<M, P>;

  type AuthenticatedModelListResponseActionMap<M extends Model.HttpModel, P = any> = ModelListResponseActionMap<
    M,
    P
  > & {
    readonly updating?: ActionCreator<ModelListActionPayload>;
    readonly creating?: ActionCreator<boolean>;
    readonly removeFromState: ActionCreator<number>;
    readonly deleting?: ActionCreator<ModelListActionPayload>;
    readonly addToState: ActionCreator<M>;
    readonly updateInState: ActionCreator<UpdateActionPayload<M>>;
    /* We cannot type this strictly as string because there are some cases where
		   supplementary data is provided (Actual Owners). */
    readonly setSearch?: ActionCreator<string> | ContextActionCreator<string, any>;
    readonly setPagination: ActionCreator<Pagination>;
    readonly updateOrdering?: ActionCreator<UpdateOrderingPayload<string>>;
  };

  interface ModelListResponseTaskMap<P = any> {
    readonly request: Task<P>;
  }

  type TableTaskMap<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel, C = any> = {
    readonly request: ContextTask<TableRequestPayload, C>;
    readonly handleChangeEvent: TableEventTask<Table.ChangeEvent<R, M>, R, M, C>;
  };

  type TableActionMap<M extends Model.RowHttpModel = Model.RowHttpModel, C = any> = {
    readonly request: ContextActionCreator<TableRequestPayload, C>;
    readonly loading: ActionCreator<boolean>;
    readonly response: ActionCreator<Http.TableResponse<M>>;
    readonly setSearch: ActionCreator<string> | ContextActionCreator<string, C>;
  };

  type AuthenticatedTableActionMap<
    R extends Table.RowData = object,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C = any
  > = TableActionMap<M, C> & {
    readonly tableChanged: ContextActionCreator<Table.ChangeEvent<R, M>, C>;
    readonly saving: ActionCreator<boolean>;
    readonly addModelsToState: ActionCreator<AddModelsToTablePayload<M>>;
    readonly updateRowsInState?: ActionCreator<UpdateRowsInTablePayload<R>>;
  };

  type TableStore<D extends Table.RowData = object> = {
    readonly data: Table.BodyRow<D>[];
    readonly search: string;
    readonly loading: boolean;
    readonly saving: boolean;
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
