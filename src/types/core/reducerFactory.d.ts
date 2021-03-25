/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace ReducerFactory {
  type Transformer<S, P = any, A extends Redux.IAction<any> = Redux.IAction<any>> = (
    payload: P,
    st: S,
    action: A
  ) => any;

  type Transformers<O, S, A extends Redux.IAction<any> = Redux.IAction<any>> = Partial<
    Record<keyof O, Transformer<S, any, A>>
  >;

  type TransformerExtensions<S, A extends Redux.IAction<any> = Redux.IAction<any>> = Record<
    string,
    Transformer<S, any, A>
  >;

  type ActionMap = { [key: string]: string };

  type ITableDataActionMap = {
    SetData: string;
    AddPlaceholders: string;
    RemoveRow: string;
    UpdateRow: string;
    ActivatePlaceholder: string;
    SelectRow: string;
    DeselectRow: string;
    SelectAllRows: string;
    AddErrors: string;
    AddGroup: string;
    RemoveGroup: string;
    UpdateGroup: string;
  };

  type ITableActionMap = {
    Request: string;
    Response: string;
    Loading: string;
    SetSearch: string;
    AddPlaceholders: string;
    RemoveRow: string;
    UpdateRow: string;
    ActivatePlaceholder: string;
    SelectRow: string;
    DeselectRow: string;
    SelectAllRows: string;
    AddErrors: string;
    AddGroup: string;
    RemoveGroup: string;
    UpdateGroup: string;
  };

  type IDetailResponseActionMap = {
    Loading: string;
    Response: string;
    Request: string;
    RemoveFromState: string;
    UpdateInState: string;
  };

  type IListResponseActionMap = {
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
  };

  interface ICommentsListResponseActionMap extends IListResponseActionMap {
    Submitting: string;
    Deleting: string;
    Editing: string;
    Replying: string;
  }

  interface IOptions<S> {
    referenceEntity: string;
    initialState: S;
  }

  interface ITransformerReducerOptions<S, A extends Redux.IAction<any> = Redux.IAction<any>> extends IOptions<S> {
    referenceEntity: string;
    initialState: S;
    excludeActions?: (action: A, state: S) => boolean | undefined | void;
    excludeActionsFromExtensions?: boolean;
    extensions?: TransformerExtensions<S, A>;
    extension?: Reducer<S, A>;
    keyReducers?: { [key: string]: Reducer<any, A> };
  }

  interface ITableReducerOptions<
    R extends Table.Row<G, C>,
    M extends Model,
    G extends Table.RowGroup = Table.RowGroup,
    C extends Table.RowChild = Table.RowChild,
    S extends Redux.ITableStore<R, M, G, C> = Redux.ITableStore<R, M, G, C>
  > extends IOptions<S> {}
}
