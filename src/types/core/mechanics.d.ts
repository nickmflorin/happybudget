/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />

interface MappedField<M extends Model> {
  field: keyof M;
  required?: boolean;
  allowNull?: boolean;
  allowBlank?: boolean;
  excludeFromPost?: boolean;
  http?: boolean;
  placeholderValue?: any;
}

interface MappingConfig<M extends Model, C extends Model = UnknownModel> {
  readonly fields: MappedField<M>[];
  readonly childrenGetter?: ((model: M) => C[]) | string | null;
  readonly groupGetter?: ((model: M) => number | null) | string | null;
  readonly labelGetter: (model: M) => string;
  readonly typeLabel: string;
  readonly rowType: Table.RowType;
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace ReducerFactory {
  type Transformer<S, P = any, A extends Redux.IAction<P> = Redux.IAction<P>> = (payload: P, st: S, action: A) => any;

  type Transformers<O, S, A extends Redux.IAction<any> = Redux.IAction<any>> = Partial<
    Record<keyof O, Transformer<S, any, A>>
  >;

  type TransformerExtensions<S, A extends Redux.IAction<any> = Redux.IAction<any>> = Record<
    string,
    Transformer<S, any, A>
  >;

  type ICounterActionMap = {
    Set: string;
    Increment: string;
    Decrement: string;
    Clear: string;
  };

  type ITablePlaceholdersActionMap = {
    AddToState: string;
    Clear: string;
    RemoveFromState: string;
    UpdateInState: string;
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
    SelectAll: string;
    Deselect: string;
    Request: string;
    Deleting: string;
    Updating: string;
    Creating: string;
  };

  type ICommentsListResponseActionMap = {
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
    SelectAll: string;
    Deselect: string;
    Request: string;
    Deleting: string;
    Updating: string;
    Creating: string;
    Replying: string;
  };

  interface IOptions<S, A extends Redux.IAction<any> = Redux.IAction<any>> extends IOptions<S> {
    referenceEntity: string;
    initialState: S;
    excludeActions: null | ((action: A, state: S) => boolean | undefined | void);
    transformers: TransformerExtensions<S, A>;
    extension: Reducer<S, A> | Reducer<S, A>[] | null;
    keyReducers: { [key: string]: Reducer<any, A> };
    strictSelect: boolean;
  }
}
