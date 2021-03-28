/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />

type Processor<M extends Model> = (model: M) => M;

interface MappedField<M extends Model> {
  field: keyof M;
  requiredForPost?: boolean;
  calculatedField?: boolean;
  usedToCalculate?: boolean;
  excludeFromPost?: boolean;
}

interface MappingConfig<
  M extends Model,
  G extends Table.RowGroup = Table.RowGroup,
  C extends Table.RowChild = Table.RowChild
> {
  readonly fields: MappedField<M>[];
  readonly childrenGetter?: ((model: M) => C[]) | string | null;
  readonly groupGetter?: ((model: M) => G | null) | string | null;
  readonly labelGetter: (model: M) => string;
  readonly processor?: Processor<M>;
  readonly typeLabel: string;
}

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

  type ICounterActionMap = {
    Set: string;
    Increment: string;
    Decrement: string;
    Clear: string;
  };

  type ITablePlaceholdersActionMap = {
    AddToState: string;
    Activate: string;
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

  interface IListTransformerReducerOptions<S, A extends Redux.IAction<any> = Redux.IAction<any>>
    extends ITransformerReducerOptions<S, A> {
    strictSelect?: boolean;
  }
}
