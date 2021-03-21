/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace ReducerFactory {
  type Transformer<S, A extends Redux.IAction<any>> = (payload: any, st: S, action: A) => any;

  type Transformers<O, S, A extends Redux.IAction<any>> = Partial<Record<keyof O, Transformer<S, A>>>;

  type TransformerExtensions<S, A extends Redux.IAction<any>> = Record<string, Transformer<S, A>>;

  type IActionMap = { [key: string]: string };

  interface ICommonTableActionMap extends IActionMap {
    AddPlaceholders: string;
    RemoveRow: string;
    UpdateRow: string;
    ActivatePlaceholder: string;
    SelectRow: string;
    DeselectRow: string;
    SelectAllRows: string;
    AddErrors: string;
  }

  interface ITableDataActionMap extends ICommonTableActionMap {
    SetData: string;
  }

  interface ITableActionMap extends ICommonTableActionMap {
    Request: string;
    Response: string;
    Loading: string;
    SetSearch: string;
  }

  interface IDetailResponseActionMap extends IActionMap {
    Loading: string;
    Response: string;
    Request: string;
    RemoveFromState: string;
    UpdateInState: string;
  }

  interface IListResponseActionMap extends IActionMap {
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
    R extends Table.Row<F, E>,
    M extends Model,
    S extends Redux.ITableStore<R, M> = Redux.ITableStore<R, M>
  > extends IOptions<S> {}
}
