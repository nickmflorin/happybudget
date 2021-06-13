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

  type Task<P = any, A extends Redux.Action<P> = Redux.Action<P>> = (action: A) => SagaIterator;

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: number; value: boolean };
  type ModelListActionInstance = { id: number; count: number };
  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateModelActionPayload<M> {
    id: number;
    data: Partial<M>;
  }

  interface ModelDetailResponseStore<T extends Model.Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  interface ListResponseStore<T> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  interface ModelListResponseStore<T extends Model.Model> extends Redux.ListResponseStore<T> {
    readonly page: number;
    readonly pageSize: number;
    readonly search: string;
    readonly selected: number[];
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly objLoading: Redux.ModelListActionStore;
    readonly creating: boolean;
  }

  interface CommentsListResponseStore extends Redux.ModelListResponseStore<Model.Comment> {
    readonly replying: number[];
  }

  type IndexedStore<T> = { [key: number]: T };
  type IndexedDetailResponseStore<T> = IndexedStore<DetailResponseStore<T>>;
}
