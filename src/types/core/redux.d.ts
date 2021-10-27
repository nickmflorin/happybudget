namespace Redux {
  type GenericSelectorFunc<S, T = any> = (state: S) => T;
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Authenticated.Store, T>;
  type UnauthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Unauthenticated.Store, T>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true
    ? AuthenticatedSelectorFunc<T>
    : UnauthenticatedSelectorFunc<T>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | UnauthenticatedSelectorFunc<T>;

  type AsyncId = `async-${string}`;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AsyncStores<S = any> = { [key in AsyncId]: S };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Transformers<S = any, A = any> = {
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    [K in keyof A]: Redux.Reducer<S>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Task<P = any> = (action: Redux.Action<P>) => import("@redux-saga/types").SagaIterator;
  type TaskMapObject<M = any> = {
    [K in keyof M]-?: Redux.Task<M[K]>;
  };

  type ActionMapObject<M = any> = {
    [K in keyof M]: undefined extends M[K]
      ? import("@reduxjs/toolkit").PayloadActionCreator<Exclude<M[K], undefined>>
      : import("@reduxjs/toolkit").PayloadActionCreator<M[K]>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Reducer<S, A = Redux.Action> = import("redux").Reducer<S, A>;
  type ReducersMapObject<S = any> = {
    [K in keyof S]-?: Redux.Reducer<S[K]>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ReducersWithAsyncMapObject<S = any> = ReducersMapObject<S> &
    {
      /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
      [K in AsyncId]: Redux.Reducer<any>;
    };

  type SagaManager = {
    readonly injectSaga: (id: Table.AsyncId, saga: import("redux-saga").Saga) => void;
    readonly ejectSaga: (id: Table.AsyncId) => void;
  };

  type ReducerManager<S extends Application.Store> = {
    readonly getReducerMap: () => Redux.ReducersWithAsyncMapObject<S>;
    readonly reduce: (state: S | undefined, action: Redux.Action) => S;
    readonly injectReducer: (key: Table.AsyncId, reducer: Redux.Reducer<any>) => void;
    readonly ejectReducer: (key: Table.AsyncId) => void;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type StoreObj = Record<string, any> | boolean | number;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Store<S extends Application.Store> = import("redux").Store<S, Redux.Action> & {
    readonly reducerManager: ReducerManager<S>;
    readonly sagaManager: SagaManager;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Dispatch = import("redux").Dispatch<Redux.Action>;

  interface Action<P = any> {
    readonly payload: P;
    readonly type: string;
    readonly isAuthenticated?: boolean | undefined;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AuthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated?: true | undefined };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type UnauthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated: false };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelLookup<M extends Model.Model> = ID | ((m: M) => boolean);

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type FindModelOptions = {
    readonly warnIfMissing?: boolean;
    readonly name?: string;
  };

  type TaskConfig<A> = {
    readonly actions: ActionMapObject<A>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ReducerConfig<S, A> = TaskConfig<A> & {
    readonly initialState: S;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SagaConfig<T, A> = TaskConfig<A> & {
    readonly tasks: TaskMapObject<T>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ListStore<T> = T[];

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelListActionPayload = { id: ID; value: boolean };
  type ModelListActionInstance = { id: ID; count: number };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelListActionStore = ModelListActionInstance[];

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface UpdateActionPayload<T extends object, Id extends ID = number> {
    id: Id;
    data: Partial<T>;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type TableRequestPayload = { ids: number[] } | null;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModelDetailResponseStore<T extends Model.HttpModel> {
    readonly data: T | null;
    readonly loading: boolean;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModelDetailResponseActionMap<M extends Model.HttpModel> {
    readonly loading: boolean;
    readonly response: M | null;
    readonly updateInState: Redux.UpdateActionPayload<M>;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ListResponseActionMap<T> = {
    readonly request: null;
    readonly loading: boolean;
    readonly response: Http.ListResponse<T>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ListResponseTaskMap {
    readonly request: null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModelListResponseStore<T extends Model.HttpModel> extends Redux.ListResponseStore<T> {
    readonly cache: SearchCache<T>;
    readonly search: string;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
    readonly selected: number[];
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModelListResponseActionMap<M extends Model.HttpModel> = ListResponseActionMap<M> & {
    readonly updating: Redux.ModelListActionPayload;
    readonly creating: boolean;
    readonly removeFromState: number;
    readonly deleting: Redux.ModelListActionPayload;
    readonly addToState: M;
    readonly updateInState: Redux.UpdateActionPayload<M>;
    readonly setSearch: string;
    readonly restoreSearchCache: null;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModelListResponseTaskMap {
    readonly request: null;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type CommentsListResponseActionMap = Omit<
    Redux.ModelListResponseActionMap<Model.Comment>,
    "addToState" | "setSearch" | "restoreSearchCache"
  > & {
    readonly submit: { parent?: number; data: Http.CommentPayload };
    readonly delete: number;
    readonly edit: Redux.UpdateActionPayload<Model.Comment>;
    readonly addToState: { data: Model.Comment; parent?: number };
    readonly replying: Redux.ModelListActionPayload;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type CommentsListResponseTaskMap = Redux.ModelListResponseTaskMap & {
    readonly submit: { parent?: number; data: Http.CommentPayload };
    readonly delete: number;
    readonly edit: Redux.UpdateActionPayload<Model.Comment>;
  };

  // Holds previously searched for results.  Note that this may not play well
  // with pagination, in which case we will have to adjust (but we are currently
  // not using pagination anywhere that we are using this cache).
  type SearchCache<T extends Model.HttpModel> = { [key: string]: Http.ListResponse<T> };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type TableTaskMap<R extends Table.RowData, M extends Model.TypedHttpModel = Model.TypedHttpModel> = {
    readonly request: null;
    readonly handleChangeEvent: Table.ChangeEvent<R, M>;
  };

  type TableActionMap<M extends Model.TypedHttpModel = Model.TypedHttpModel> = {
    readonly loading: boolean;
    readonly response: Http.TableResponse<M>;
    readonly request?: Redux.TableRequestPayload;
    readonly setSearch: string;
    readonly clear: null;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AuthenticatedTableActionMap<
    R extends Table.RowData = object,
    M extends Model.TypedHttpModel = Model.TypedHttpModel
  > = TableActionMap<M> & {
    readonly tableChanged: Table.ChangeEvent<R, M>;
    readonly saving: boolean;
    readonly addModelsToState: AddModelsToTablePayload<M>;
    readonly updateModelsInState?: UpdateModelsInTablePayload<M>;
    readonly updateRowsInState?: UpdateRowsInTablePayload<R>;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type TableStore<D extends Table.RowData = object> = {
    readonly data: Table.BodyRow<D>[];
    readonly search: string;
    readonly loading: boolean;
    readonly saving: boolean;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AddModelsToTablePayload<M extends Model.HttpModel> = {
    readonly placeholderIds: Table.PlaceholderRowId[];
    readonly models: M[];
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type UpdateModelsInTablePayload<M extends Model.HttpModel> = SingleOrArray<M>;

  type UpdateRowPayload<R extends Table.RowData> = {
    readonly data: Partial<R>;
    readonly id: Table.ModelRowId;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type UpdateRowsInTablePayload<R extends Table.RowData> = SingleOrArray<UpdateRowPayload<R>>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type BudgetTableStore<R extends Tables.BudgetRowData> = Redux.TableStore<R>;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface CommentsListResponseStore extends Redux.ModelListResponseStore<Model.Comment> {
    readonly replying: number[];
  }
}
