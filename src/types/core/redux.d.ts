/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  type GenericSelectorFunc<S extends Modules.StoreObj, T = any> = (state: S) => T;
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Application.Authenticated.Store, T>;
  type UnauthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Modules.Unauthenticated.Store, T>;
  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true ? AuthenticatedSelectorFunc<T> : UnauthenticatedSelectorFunc<T>;
  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | UnauthenticatedSelectorFunc<T>;

  type AsyncId = `async-${string}`
  type AsyncStores<S = any> = { [key in AsyncId]: S };

  type Transformers<S = any, A = any> = {
    [K in keyof A]: Redux.Reducer<S>
  }

  type Task<P = any> = (action: Redux.Action<P>) => import("@redux-saga/types").SagaIterator;
  type TaskMapObject<M = any> = {
    [K in keyof M]-?: Redux.Task<M[K]>
  }

  type ActionMapObject<M = any> = {
    [K in keyof M]-?: import("@reduxjs/toolkit").PayloadActionCreator<M[K]>
  }

  type Reducer<S, A = Redux.Action> = import("redux").Reducer<S, A>;
  type ReducersMapObject<S = any> = {
    [K in keyof S]-?: Redux.Reducer<S[K]>
  }
  type ReducersWithAsyncMapObject<S = any> = ReducersMapObject<S> & {
    [K in AsyncId]: Redux.Reducer<any>
  }

  type SagaManager = {
    readonly injectSaga: (id: Redux.AsyncId, saga: import("redux-saga").Saga) => void;
    readonly ejectSaga: (id: Redux.AsyncId) => void;
  };

  type ReducerManager<S extends Application.Store> = {
    readonly getReducerMap: () => Redux.ReducersWithAsyncMapObject<S>;
    readonly reduce: (state: S | undefined, action: Redux.Action) => S;
    readonly injectReducer: (key: Redux.AsyncId, reducer: Redux.Reducer<any>) => void;
    readonly ejectReducer: (key: Redux.AsyncId) => void;
  };

  type StoreObj = Record<string, any> | boolean | number;
  type Store<S> = import("redux").Store<S, Redux.Action> & {
    readonly reducerManager: ReducerManager<S>;
    readonly sagaManager: SagaManager;
  }

  type Dispatch = import("redux").Dispatch<Redux.Action>;
  type DispatchWithoutActionOptions<T extends keyof ActionOptions> = Redux.Dispatch<Omit<Redux.Action, T>>;

  type ActionOptions = {
    readonly type: string;
    // readonly asyncId?: Redux.AsyncId;
    readonly isAuthenticated?: boolean | undefined;
  };

  interface Action<P = any> extends import("redux").AnyAction, ActionOptions {
    readonly payload: P;
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
  }

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: ID; value: boolean };
  type ModelListActionInstance = { id: ID; count: number };
  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateActionPayload<T extends object> {
    id: ID;
    data: Partial<T>;
  }

  interface ModelDetailResponseStore<T extends Model.Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  interface ModelDetailResponseActionMap<M extends Model.Model> {
    readonly loading: boolean;
    readonly request: null;
    readonly response: M | undefined;
    readonly updateInState: Redux.UpdateActionPayload<M>;
  }

  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  type ListResponseActionMap<T> = {
    readonly loading: boolean;
    readonly request: null;
    readonly response: Http.ListResponse<M>;
  }

  interface ListResponseTaskMap {
    readonly request: null;
  }

  interface ModelListResponseStore<T extends Model.Model> extends Redux.ListResponseStore<T> {
    readonly cache: SearchCache;
    readonly search: string;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
    readonly selected: ID[];
  }

  type ModelListResponseActionMap<M extends Model.Model> = {
    readonly loading: boolean;
    readonly request: null;
    readonly updating: Redux.ModelListActionPayload;
    readonly creating: boolean;
    readonly removeFromState: ID;
    readonly deleting: Redux.ModelListActionPayload;
    readonly response: Http.ListResponse<M>;
    readonly addToState: M;
    readonly updateInState: Redux.UpdateActionPayload<M>;
    readonly setSearch: string;
    readonly restoreSearchCache: null;
  }

  interface ModelListResponseTaskMap {
    readonly request: null;
  }

  type CommentsListResponseActionMap = Omit<Redux.ModelListResponseActionMap<Model.Comment>, "addToState" | "setSearch" | "restoreSearchCache"> & {
    readonly submit: { parent?: ID; data: Http.CommentPayload };
    readonly delete: ID;
    readonly edit: Redux.UpdateActionPayload<Model.Comment>;
    readonly addToState: { data: Model.Comment; parent?: ID };
    readonly replying: Redux.ModelListActionPayload;
  };

  type CommentsListResponseTaskMap = Redux.ModelListResponseTaskMap & {
    readonly submit: { parent?: ID; data: Http.CommentPayload };
    readonly delete: ID;
    readonly edit: Redux.UpdateActionPayload<Model.Comment>;
  };

  // Holds previously searched for results.  Note that this may not play well
  // with pagination, in which case we will have to adjust (but we are currently
  // not using pagination anywhere that we are using this cache).
  type SearchCache<T extends Model.Model> = { [key: string]: Http.ListResponse<T> };

  type TableTaskMap<R extends Table.RowData, M extends Model.Model = Model.Model> = {
    readonly request: null;
    readonly handleRowAddEvent: Table.RowAddEvent<R, M>;
    readonly handleRowDeleteEvent: Table.RowDeleteEvent<R, M>;
    readonly handleDataChangeEvent: Table.DataChangeEvent<R, M>;
  }

  type TableTaskMapWithGroups<R extends Table.RowData, M extends Model.Model = Model.Model> = TableTaskMap<R, M> & {
    readonly handleAddRowToGroupEvent: Table.RowAddToGroupEvent<R, M>;
    readonly handleRemoveRowFromGroupEvent: Table.RowRemoveFromGroupEvent<R, M>;
    readonly handleDeleteGroupEvent: Table.GroupDeleteEvent;
  }

  type TableActionMap<M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = {
    readonly loading: boolean;
    readonly response: Http.TableResponse<M, G>;
    readonly request: null;
    readonly setSearch: string;
  }

  type AuthenticatedTableActionMap<R extends Table.RowData = any, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = TableActionMap<M, G> & {
    readonly tableChanged: Table.ChangeEvent<R, M>;
    readonly saving: boolean;
    readonly addModelsToState: Redux.AddModelsToTablePayload<M>;
  }

  type TableStore<D extends Table.RowData = any, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = {
    readonly data: Table.Row<D, M>[];
    readonly models: M[];
    readonly groups: G[];
    readonly search: string;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
    readonly saving: boolean;
  }

  type AddModelsToTablePayload<M extends Model.Model> = { readonly placeholderIds: Table.PlaceholderRowId[]; readonly models: M[] };

  type InferTableRow<S> = S extends Redux.TableStore<infer R> ? R : unknown;
  type InferTableModel<S> = S extends TableStore<any, infer M> ? M : unknown;
  type InferTableGroup<S> = S extends TableStore<any, any, infer G> ? G : unknown;

  type BudgetTableStore<R extends Table.Row = Table.Row, M extends Model.Model = Model.Model> = Redux.TableStore<R, M, Model.BudgetGroup>;

  interface CommentsListResponseStore extends Redux.ModelListResponseStore<Model.Comment> {
    readonly replying: ID[];
  }
}
