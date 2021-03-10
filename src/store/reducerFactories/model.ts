import { Reducer } from "redux";

export type Transformer<S, A extends Redux.IAction<any>> = (payload: any, st: S, action: A) => any;

export type Transformers<O, S, A extends Redux.IAction<any>> = Partial<Record<keyof O, Transformer<S, A>>>;

export type TransformerExtensions<S, A extends Redux.IAction<any>> = Record<string, Transformer<S, A>>;

export type IReducerFactoryActionMap = { [key: string]: string };

interface ICommonTableActionMap {
  AddPlaceholders: string;
  RemoveRow: string;
  UpdateRow: string;
  ActivatePlaceholder: string;
  SelectRow: string;
  DeselectRow: string;
  SelectAllRows: string;
  AddErrors: string;
}

export interface ITableDataActionMap extends ICommonTableActionMap {
  SetData: string;
}

export interface ITableActionMap extends ICommonTableActionMap {
  Request: string;
  Response: string;
  Loading: string;
  SetSearch: string;
}

export interface IDetailResponseActionMap extends IReducerFactoryActionMap {
  Loading: string;
  Response: string;
  Request: string;
  RemoveFromState: string;
  UpdateInState: string;
}

export interface IListResponseActionMap extends IReducerFactoryActionMap {
  SetSearch: string;
  Loading: string;
  Response: string;
  SetPage: string;
  SetPageSize: string;
  SetPageAndSize: string;
  AddToState: string;
  RemoveFromState: string;
  UpdateInState: string;
  Select: string;
  Request: string;
}

export interface IReducerFactoryOptions<S> {
  referenceEntity: string;
  initialState: S;
}

export interface ITableReducerOptions<
  F extends string,
  E extends Table.IRowMeta<F, Y>,
  R extends Table.IRow<F, E>,
  M extends Model,
  Y extends Table.ICellError<F> = Table.ICellError<F>,
  S extends Redux.ITableStore<F, E, R, M> = Redux.ITableStore<F, E, R, M>
> extends IReducerFactoryOptions<S> {}

export interface IDetailResponseReducerOptions<
  M extends Model,
  S extends Redux.IDetailResponseStore<M> = Redux.IDetailResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
> extends IReducerFactoryOptions<S> {
  excludeActions?: (action: A, state: S) => boolean | undefined | void;
  excludeActionsFromExtensions?: boolean;
  extensions?: TransformerExtensions<S, A>;
}

/**
 * A reducer factory that creates a generic reducer to handle the state of a
 * list response, where a list response might be the response received from
 * submitting an API request to /entity/ (i.e. a list of results).
 *
 * The reducer has default behavior that is mapped to the action types via
 * the mappings parameter.
 *
 * @param mappings  Mappings of the standard actions to the specific actions that
 *                  the reducer should listen for.
 * @param options   Additional options supplied to the reducer factory.
 */
export interface IListResponseReducerOptions<
  M extends Model,
  S extends Redux.IListResponseStore<M> = Redux.IListResponseStore<M>,
  A extends Redux.IAction<any> = Redux.IAction<any>
> extends IReducerFactoryOptions<S> {
  excludeActions?: (action: A, state: S) => boolean | undefined | void;
  excludeActionsFromExtensions?: boolean;
  extensions?: TransformerExtensions<S, A>;
  listReducer?: Reducer<M[], A>;
  itemReducer?: Reducer<M, A>;
  extension?: Reducer<S, A>;
}
