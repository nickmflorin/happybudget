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

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: number; value: boolean };

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
    budget: Budget.IStore;
  }

  namespace Dashboard {
    type ActionDomain = "trash" | "active";

    /* eslint-disable no-shadow */
    interface IAction<T = any> extends Redux.IAction<T> {
      readonly domain: ActionDomain;
    }

    interface IActiveBudgetsListStore extends IListResponseStore<IBudget> {
      deleting: number[];
    }

    interface ITrashBudgetsListStore extends IListResponseStore<IBudget> {
      deleting: number[];
      restoring: number[];
    }

    interface IBudgetsStore {
      active: IActiveBudgetsListStore;
      trash: ITrashBudgetsListStore;
    }

    interface IStore {
      budgets: IBudgetsStore;
    }
  }

  namespace Budget {
    /* eslint-disable no-shadow */
    interface IAction<T = any> extends Redux.IAction<T> {
      readonly budgetId?: number | undefined;
      readonly accountId?: number | undefined;
      readonly subaccountId?: number | undefined;
    }

    interface ISubAccountListResponseStore {
      deleting: ListStore<number>;
      updating: ListStore<number>;
      creating: boolean;
      list: IListResponseStore<ISubAccount>;
      table: ListStore<ISubAccountRow>;
    }

    interface ISubAccountStore {
      detail: IDetailResponseStore<ISubAccount>;
      subaccounts: ISubAccountListResponseStore;
    }

    interface IAccountStore {
      detail: IDetailResponseStore<IAccount>;
      subaccounts: ISubAccountListResponseStore;
    }

    interface IAccountsStore {
      list: IListResponseStore<IAccount>;
      table: IListStore<IAccountRow>;
      details: IIndexedStore<IAccountStore>;
      deleting: ListStore<number>;
      updating: ListStore<number>;
      creating: boolean;
    }

    interface IRow {
      id: number | string;
      selected: boolean;
      isPlaceholder: boolean;
    }

    interface IAccountRow extends IRow {
      id: number | string;
      account_number: string | null;
      description: string | null;
    }

    interface ISubAccountRow extends IRow {
      id: number | string;
      line: string | null;
      name: string | null;
      description: string | null;
      quantity: number | null;
      unit: Unit | null;
      multiplier: number | null;
      rate: number | null;
    }

    interface IStore {
      budget: IDetailResponseStore<IBudget>;
      accounts: IAccountsStore;
      subaccounts: IIndexedStore<ISubAccountStore>;
      ancestors: ListStore<IAncestor>;
    }
  }
}
