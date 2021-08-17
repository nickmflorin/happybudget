/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  type GenericSelectorFunc<S extends Modules.Store, T = any> = (state: S) => T;
  type AuthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Modules.Authenticated.Store, T>;
  type UnauthenticatedSelectorFunc<T = any> = GenericSelectorFunc<Modules.Unauthenticated.Store, T>;
  type SwitchSelectorFunc<AUTH extends boolean = true, T = any> = AUTH extends true ? AuthenticatedSelectorFunc<T> : UnauthenticatedSelectorFunc<T>;
  type SelectorFunc<T = any> = AuthenticatedSelectorFunc<T> | UnauthenticatedSelectorFunc<T>;

  type Store = Record<string, any> | boolean | number;
  type Reducer<S extends Redux.Store> = import("redux").Reducer<S, Redux.Action>;

  interface ActionConfig {
    readonly error?: Error | string | undefined;
    readonly meta?: any;
  }

  interface Action<P = any> extends Action<string> {
    readonly type: string;
    readonly payload: P;
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    // Even though this is "optional" - it will always be set via the middleware.
    readonly isAuthenticated?: boolean;
  }
  type AuthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated?: true | undefined };
  type UnauthenticatedAction<P = any> = Action<P> & { readonly isAuthenticated: false };

  type ActionCreator<P = any> = (
    payload: P,
    options?: Redux.ActionConfig | undefined
  ) => Redux.Action<P>;

  type ActionMap = Record<string, string>;
  type ActionCreatorMap = Record<string, Redux.ActionCreator<any>>;
  type TaskMap = Record<string, Redux.Task<any>>;
  type Task<P = any> = (action: Redux.Action<P>) => SagaIterator;

  type ModelLookup<M extends Model.Model> = number | ((m: M) => boolean);

  type FindModelOptions = {
    readonly warnIfMissing?: boolean;
    readonly name?: string;
  };

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: number; value: boolean };
  type ModelListActionInstance = { id: number; count: number };
  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateModelActionPayload<M> {
    id: number;
    data: Partial<M>;
  }

  type ReadOnlyDetailResponseActionMap = {
    Loading: string;
    Response: string;
    Request: string;
  }

  type DetailResponseActionMap = ReadOnlyDetailResponseActionMap & {
    RemoveFromState: string;
    UpdateInState: string;
  };

  interface ModelDetailResponseStore<T extends Model.Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }
  type ReadOnlyModelDetailResponseStore<T extends Model.Model> = ModelDetailResponseStore<T>;

  type ListResponseActionMap = {
    readonly Loading: string;
    readonly Response: string;
    readonly Request: string;
  };

  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  // Holds previously searched for results.  Note that this may not play well
  // with pagination, in which case we will have to adjust (but we are currently
  // not using pagination anywhere that we are using this cache).
  type SearchCache<T extends Model.Model> = { [key: string]: Http.ListResponse<T> };

  type ReadOnlyTableSideEffectActionMap = {
    readonly Request: string;
  }

  type TableSideEffectActionMap = {
    readonly Request: string;
    readonly TableChanged: string;
  }

  type ReadOnlyTableActionMap = ListResponseActionMap & ReadOnlyTableSideEffectActionMap & {
    // Optional right now because we do not search for fringes in ReadOnly mode.
    readonly SetSearch?: string;
  }

  type TableActionMap = ListResponseActionMap & TableSideEffectActionMap & {
    readonly SetSearch: string;
    readonly AddToState: string;
    readonly Deleting: string;
    readonly Updating: string;
    readonly Creating: string;
    // In most cases, RemoveFromState and UpdateInState actions are completely handled by the
    // TableChanged action in the reducer.
    readonly RemoveFromState?: string;
    readonly UpdateInState?: string;
  }

  type ReadOnlyTableActionCreatorMap<M extends Model.Model> = {
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<M>>;
    request: Redux.ActionCreator<null>;
  }

  type TableActionCreatorMap<M extends Model.Model> = {
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    creating: Redux.ActionCreator<boolean>;
    updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
    addToState: Redux.ActionCreator<M>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<M>>;
    request: Redux.ActionCreator<null>;
  }

  interface ReadOnlyTableTaskMap<R extends Table.Row, M extends Model.Model> {
    request: Redux.Task<null>;
  }

  interface TableTaskMap<R extends Table.Row, M extends Model.Model> extends ReadOnlyTableTaskMap<R, M> {
    handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
    handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
    handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
  }

  type ReadOnlyTableStore<M extends Model.Model> = Redux.ListResponseStore<M> & {
    readonly search: string;
  }

  type TableStore<M extends Model.Model> = Redux.ListResponseStore<M> & {
    readonly search: string;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
  }

  type ReadOnlyBudgetTableSideEffectActionMap = ReadOnlyTableSideEffectActionMap & {
    readonly Groups: Pick<Redux.ReadOnlyTableActionMap, "Request">;
  }

  type BudgetTableSideEffectActionMap = TableSideEffectActionMap & {
    readonly Groups: Pick<Redux.TableActionMap, "Request">;
  }

  type ReadOnlyBudgetTableActionMap = ReadOnlyTableActionMap & {
    readonly Groups: Omit<Redux.ReadOnlyTableActionMap, "SetSearch">;
  }

  // The RemoveFromState and UpdateInState actions are completely handled by the
  // TableChanged action in the reducer.
  type BudgetTableActionMap = Omit<TableActionMap, "RemoveFromState" | "UpdateInState"> & {
    readonly Groups: Omit<Redux.TableActionMap, "TableChanged" | "Updating" | "Creating" | "RemoveFromState" | "SetSearch">;
  }

  type ReadOnlyBudgetTableWithFringesActionMap = ReadOnlyBudgetTableActionMap & {
    readonly Fringes: Omit<Redux.ReadOnlyTableActionMap, "SetSearch">;
  }

  type BudgetTableWithFringesActionMap = BudgetTableActionMap & {
    readonly Fringes: Redux.TableActionMap;
  }

  type ReadOnlyBudgetTableActionCreatorMap<M extends Model.Model> = Redux.ReadOnlyTableActionCreatorMap<M> & {
    groups: {
      loading: Redux.ActionCreator<boolean>;
      response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
      request: Redux.ActionCreator<null>;
    };
  }

  type BudgetTableActionCreatorMap<M extends Model.Model> = Redux.TableActionCreatorMap<M> & {
    groups: {
      deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
      loading: Redux.ActionCreator<boolean>;
      response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
      request: Redux.ActionCreator<null>;
    };
  }

  type ReadOnlyBudgetTableTaskMap<R extends Table.Row, M extends Model.Model> = Redux.ReadOnlyTableTaskMap<R, M> & {
    requestGroups: Redux.Task<null>;
  }

  type BudgetTableTaskMap<R extends Table.Row, M extends Model.Model> = Redux.TableTaskMap<R, M> & {
    requestGroups: Redux.Task<null>;
    handleAddRowToGroupEvent?: Redux.Task<Table.RowAddToGroupEvent<R, M>>;
    handleRemoveRowFromGroupEvent?: Redux.Task<Table.RowRemoveFromGroupEvent<R, M>>;
    handleDeleteGroupEvent?: Redux.Task<Table.GroupDeleteEvent>;
  }

  type ReadOnlyBudgetTableStore<M extends Model.Model> = Redux.ReadOnlyTableStore<M> & {
    readonly groups: Redux.ReadOnlyTableStore<Model.Group>;
  }

  type BudgetTableStore<M extends Model.Model> = Redux.TableStore<M> & {
    readonly groups: Redux.TableStore<Model.Group>;
  }

  type ReadOnlyBudgetTableWithFringesStore<M extends Model.Model> = Redux.ReadOnlyBudgetTableStore<M> & {
    readonly fringes: Redux.ReadOnlyTableStore<Model.Fringe>;
  }

  type BudgetTableWithFringesStore<M extends Model.Model> = Redux.BudgetTableStore<M> & {
    readonly fringes: Redux.TableStore<Model.Fringe>;
  }

  type ReadOnlyModelListResponseActionMap = ReadOnlyTableActionMap & {
    readonly RestoreSearchCache?: string;
  };

  type ModelListResponseActionMap = Omit<TableActionMap, "TableChanged"> & {
    readonly Select: string;
    readonly SelectAll: string;
    readonly Deselect: string;
    readonly RestoreSearchCache?: string;
  };

  interface ReadOnlyModelListResponseStore<T extends Model.Model> extends Redux.ReadOnlyTableStore<T> {
    readonly cache: SearchCache;
  }

  interface ModelListResponseStore<T extends Model.Model> extends Redux.TableStore<T> {
    readonly cache: SearchCache;
    readonly selected: number[];
  }

  type CommentsListResponseActionMap = ModelListResponseActionMap & {
    Replying: string;
  };

  interface CommentsListResponseStore extends ModelListResponseStore<Model.Comment> {
    readonly replying: number[];
  }

  type IndexedStore<T> = { [key: number]: T };
  type IndexedDetailResponseStore<T> = IndexedStore<DetailResponseStore<T>>;

  interface FactoryOptions<O extends Redux.ActionMap, S> {
    readonly initialState: S;
    readonly excludeActions: null | ((action: Redux.Action, state: S) => boolean | undefined | void);
    readonly overrides?: Redux.MappedReducers<O, S>;
    readonly extension: Redux.Reducer<S> | Redux.Reducer<S>[] | null;
    readonly subReducers: { [Property in keyof Partial<S>]: Redux.Reducer<any> } | null | {};
    readonly extensions: { [key: string]: Redux.Reducer<S> } | null;
    readonly strictSelect: boolean;
  }

  type MappedReducers<O extends Redux.ActionMap, S> = Partial<
    Record<keyof O, Redux.Reducer<S>>
  >;
}
