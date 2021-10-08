/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  type GenericSelectorFunc<S, T = any> = (state: S) => T;
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Authenticated.Store, T>;
  type UnauthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Unauthenticated.Store, T>;
  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true
    ? AuthenticatedSelectorFunc<T>
    : UnauthenticatedSelectorFunc<T>;
  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | UnauthenticatedSelectorFunc<T>;

  type AsyncId = `async-${string}`;
  type AsyncStores<S = any> = { [key in AsyncId]: S };

  type Transformers<S = any, A = any> = {
    [K in keyof A]: Redux.Reducer<S>;
  };

  type Task<P = any> = (action: Redux.Action<P>) => import("@redux-saga/types").SagaIterator;
  type TaskMapObject<M = any> = {
    [K in keyof M]-?: Redux.Task<M[K]>;
  };

  type ActionMapObject<M = any> = {
    [K in keyof M]: undefined extends M[K]
      ? import("@reduxjs/toolkit").PayloadActionCreator<Exclude<M[K], undefined>>
      : import("@reduxjs/toolkit").PayloadActionCreator<M[K]>;
  };

  type Reducer<S, A = Redux.Action> = import("redux").Reducer<S, A>;
  type ReducersMapObject<S = any> = {
    [K in keyof S]-?: Redux.Reducer<S[K]>;
  };
  type ReducersWithAsyncMapObject<S = any> = ReducersMapObject<S> &
    {
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

  type StoreObj = Record<string, any> | boolean | number;
  type Store<S extends Application.Store> = import("redux").Store<S, Redux.Action> & {
    readonly reducerManager: ReducerManager<S>;
    readonly sagaManager: SagaManager;
  };

  type Dispatch = import("redux").Dispatch<Redux.Action>;

  interface Action<P = any> {
    readonly payload: P;
    readonly type: string;
    readonly isAuthenticated?: boolean | undefined;
  }

  type AuthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated?: true | undefined };
  type UnauthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated: false };

  type ModelLookup<M extends Model.Model> = ID | ((m: M) => boolean);

  type FindModelOptions = {
    readonly warnIfMissing?: boolean;
    readonly name?: string;
  };

  type TaskConfig<A> = {
    readonly actions: ActionMapObject<A>;
  };

  type ReducerConfig<S, A> = TaskConfig<A> & {
    readonly initialState: S;
  };

  type SagaConfig<T, A> = TaskConfig<A> & {
    readonly tasks: TaskMapObject<T>;
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

  interface ModelDetailResponseStore<T extends Model.HttpModel> {
    readonly data: T | null;
    readonly loading: boolean;
  }

  interface ModelDetailResponseActionMap<M extends Model.HttpModel> {
    readonly loading: boolean;
    readonly response: M | null;
    readonly updateInState: Redux.UpdateActionPayload<M>;
  }

  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
  }

  type ListResponseActionMap<T> = {
    readonly loading: boolean;
    readonly response: Http.ListResponse<T>;
  };

  interface ListResponseTaskMap {
    readonly request: null;
  }

  interface ModelListResponseStore<T extends Model.HttpModel> extends Redux.ListResponseStore<T> {
    readonly cache: SearchCache<T>;
    readonly search: string;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
    readonly selected: number[];
  }

  type ModelListResponseActionMap<M extends Model.HttpModel> = {
    readonly loading: boolean;
    readonly request: null;
    readonly updating: Redux.ModelListActionPayload;
    readonly creating: boolean;
    readonly removeFromState: number;
    readonly deleting: Redux.ModelListActionPayload;
    readonly response: Http.ListResponse<M>;
    readonly addToState: M;
    readonly updateInState: Redux.UpdateActionPayload<M>;
    readonly setSearch: string;
    readonly restoreSearchCache: null;
  };

  interface ModelListResponseTaskMap {
    readonly request: null;
  }

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

  type CommentsListResponseTaskMap = Redux.ModelListResponseTaskMap & {
    readonly submit: { parent?: number; data: Http.CommentPayload };
    readonly delete: number;
    readonly edit: Redux.UpdateActionPayload<Model.Comment>;
  };

  // Holds previously searched for results.  Note that this may not play well
  // with pagination, in which case we will have to adjust (but we are currently
  // not using pagination anywhere that we are using this cache).
  type SearchCache<T extends Model.HttpModel> = { [key: string]: Http.ListResponse<T> };

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

  type AuthenticatedTableActionMap<
    R extends Table.RowData = object,
    M extends Model.TypedHttpModel = Model.TypedHttpModel
  > = TableActionMap<M> & {
    readonly tableChanged: Table.ChangeEvent<R, M>;
    readonly saving: boolean;
    readonly addModelsToState: Redux.AddModelsToTablePayload<M>;
    readonly updateModelsInState?: SingleOrArray<M>;
  };

  type TableStore<D extends Table.RowData = object> = {
    readonly data: Table.BodyRow<D>[];
    readonly search: string;
    readonly loading: boolean;
    readonly saving: boolean;
  };

  type AddModelsToTablePayload<M extends Model.HttpModel> = {
    readonly placeholderIds: Table.PlaceholderRowId[];
    readonly models: M[];
  };

  type BudgetTableStore<R extends Tables.BudgetRowData> = Redux.TableStore<R>;

  interface CommentsListResponseStore extends Redux.ModelListResponseStore<Model.Comment> {
    readonly replying: number[];
  }
}
