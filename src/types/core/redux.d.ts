/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./main.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  interface IModuleStore {
    [key: string]: any;
  }

  type ModuleLabel = "dashboard" | "budget";

  interface IActionConfig {
    error?: Error | string | undefined;
    meta?: any;
    label?: ModuleLabel | ModuleLabel[] | undefined;
  }

  interface IAction<P = any> extends Action<string> {
    readonly type: string;
    readonly payload?: P;
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: ModuleLabel | ModuleLabel[] | undefined;
  }

  type ActionCreator<P = any, A extends Redux.IAction<P> = Redux.IAction<P>> = (
    type: string,
    payload?: P,
    options?: IActionConfig
  ) => A;

  interface IModuleConfig<S extends IModuleStore, A extends IAction<any>> {
    readonly rootSaga?: Saga;
    readonly rootReducer: Reducer<S, A>;
    readonly initialState: S | (() => S);
    readonly label: ModuleLabel;
  }

  type IApplicationConfig = IModuleConfig<any, any>[];

  interface IDetailResponseStore<T extends Model> {
    data: T | undefined;
    loading: boolean;
    id: number | undefined;
    responseWasReceived: boolean;
  }

  interface IListResponseStore<T extends Model> {
    data: T[];
    count: number;
    loading: boolean;
    page: number;
    pageSize: number;
    search: string;
    selected: number[];
    responseWasReceived: boolean;
  }

  type IIndexedStore<T> = { [key: number]: T };
  type IIndexedDetailResponseStore<T> = IIndexedStore<IDetailResponseStore<T>>;

  interface IModulesStore {}

  interface IUserStore extends IUser {}

  interface IApplicationStore extends IModulesStore {
    user: IUserStore;
    dashboard: Dashboard.IStore;
  }

  namespace Dashboard {
    interface IStore {
      budgets: IListResponseStore<IBudget>;
    }
  }
}
