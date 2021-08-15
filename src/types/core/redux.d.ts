/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  type SelectorFunc<T = any> = (state: Modules.ApplicationStore) => T;

  interface ActionConfig {
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: Modules.ModuleLabel | Modules.ModuleLabel[] | undefined;
  }

  interface Action<P = any> extends Action<string> {
    readonly type: string;
    readonly payload: P;
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: Modules.ModuleLabel | Modules.ModuleLabel[] | undefined;
  }

  type ActionCreator<P = any, A extends Redux.Action<P> = Redux.Action<P>> = (
    payload: P,
    options?: Redux.ActionConfig | undefined
  ) => A;

  type ActionMap = Record<string, string>;
  type ActionCreatorMap = Record<string, Redux.ActionCreator<any>>;
  type TaskMap = Record<string, Redux.Task<any>>;

  type Task<P = any, A extends Redux.Action<P> = Redux.Action<P>> = (action: A) => SagaIterator;

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: number; value: boolean };
  type ModelListActionInstance = { id: number; count: number };
  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateModelActionPayload<M> {
    id: number;
    data: Partial<M>;
  }

  type DetailResponseActionMap = {
    Loading: string;
    Response: string;
    Request: string;
    RemoveFromState: string;
    UpdateInState: string;
  };

  interface ModelDetailResponseStore<T extends Model.Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

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

  type TableSideEffectActionMap = {
    readonly Request: string;
    readonly TableChanged: string;
  }

  type TableActionMap = ListResponseActionMap & TableSideEffectActionMap & {
    readonly SetSearch: string;
    readonly AddToState: string;
    readonly Deleting: string;
    readonly Updating: string;
    readonly Creating: string;
    readonly RemoveFromState: string;
    readonly UpdateInState: string;
  }

  type TableActionCreatorMap<M extends Model.Model> = {
    deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
    creating: Redux.ActionCreator<boolean>;
    updating: Redux.ActionCreator<Redux.ModelListActionPayload>;
    addToState: Redux.ActionCreator<M>;
    loading: Redux.ActionCreator<boolean>;
    response: Redux.ActionCreator<Http.ListResponse<M>>;
    request: Redux.ActionCreator<null>;
    groups: {
      deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
      loading: Redux.ActionCreator<boolean>;
      response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
      request: Redux.ActionCreator<null>;
    };
  }

  interface TableTaskMap<R extends Table.Row, M extends Model.Model> {
    request: Redux.Task<null>;
    handleRowAddEvent: Redux.Task<Table.RowAddEvent<R, M>>;
    handleRowDeleteEvent: Redux.Task<Table.RowDeleteEvent<R, M>>;
    handleDataChangeEvent: Redux.Task<Table.DataChangeEvent<R, M>>;
  }

  type TableStore<M extends Model.Model> = Redux.ListResponseStore<M> & {
    readonly search: string;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
  }

  type BudgetTableSideEffectActionMap = TableSideEffectActionMap & {
    readonly Groups: Pick<Redux.TableActionMap, "Request">;
  }

  type BudgetTableActionMap = TableActionMap & {
    readonly Groups: Omit<Redux.TableActionMap, "TableChanged" | "Updating" | "Creating" | "RemoveFromState" | "SetSearch">;
  }

  type BudgetTableActionCreatorMap<M extends Model.Model> = Redux.TableActionCreatorMap<M> & {
    groups: {
      deleting: Redux.ActionCreator<Redux.ModelListActionPayload>;
      loading: Redux.ActionCreator<boolean>;
      response: Redux.ActionCreator<Http.ListResponse<Model.Group>>;
      request: Redux.ActionCreator<null>;
    };
  }

  type BudgetTableTaskMap<R extends Table.Row, M extends Model.Model> = Redux.TableTaskMap<R, M> & {
    requestGroups: Redux.Task<null>;
    handleAddRowToGroupEvent?: Redux.Task<Table.RowAddToGroupEvent<R, M>>;
    handleRemoveRowFromGroupEvent?: Redux.Task<Table.RowRemoveFromGroupEvent<R, M>>;
    handleDeleteGroupEvent?: Redux.Task<Table.GroupDeleteEvent>;
  }

  type BudgetTableStore<M extends Model.Model> = Redux.TableStore<M> & {
    readonly groups: Redux.TableStore;
  }

  type ModelListResponseActionMap = Omit<TableActionMap, "TableChanged"> & {
    readonly SetPage: string;
    readonly SetPageSize: string;
    readonly SetPageAndSize: string;
    readonly Select: string;
    readonly SelectAll: string;
    readonly Deselect: string;
    readonly RestoreSearchCache?: string;
  };

  interface ModelListResponseStore<T extends Model.Model> extends Redux.TableStore<T> {
    readonly cache: SearchCache;
    readonly page: number;
    readonly pageSize: number;
    readonly selected: number[];
  }

  type CommentsListResponseActionMap = ModelListResponseActionMap & {
    Replying: string;
  };

  interface CommentsListResponseStore extends Redux.ModelListResponseStore<Model.Comment> {
    readonly replying: number[];
  }

  type IndexedStore<T> = { [key: number]: T };
  type IndexedDetailResponseStore<T> = IndexedStore<DetailResponseStore<T>>;

  interface FactoryOptions<O extends Redux.ActionMap, S, A extends Redux.Action<any> = Redux.Action<any>> {
    readonly initialState: S;
    readonly excludeActions: null | ((action: A, state: S) => boolean | undefined | void);
    readonly overrides?: Redux.MappedReducers<O, S, A>;
    readonly extension: import("redux").Reducer<S, A> | import("redux").Reducer<S, A>[] | null;
    readonly subReducers: { [Property in keyof Partial<S>]: import("redux").Reducer<any, A> } | null | {};
    readonly extensions: { [key: string]: import("redux").Reducer<S, A> } | null;
    readonly strictSelect: boolean;
  }

  type MappedReducers<O extends Redux.ActionMap, S, A extends Redux.Action<any> = Redux.Action<any>> = Partial<
    Record<keyof O, import("redux").Reducer<S, A>>
  >;
}
