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
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: ModuleLabel | ModuleLabel[] | undefined;
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

  interface IRow {
    id: any;
    selected: boolean;
  }

  interface IDetailResponseStore<T extends Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly id: number | undefined;
    readonly responseWasReceived: boolean;
  }

  interface IListResponseStore<T extends Model> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly page: number;
    readonly pageSize: number;
    readonly search: string;
    readonly selected: number[];
    readonly responseWasReceived: boolean;
  }

  interface ITableStore<R extends IRow, M extends Model> {
    readonly data: IListStore<R>;
    readonly loading: boolean;
    readonly rawData: IListStore<M>;
    readonly search: string;
    readonly responseWasReceived: boolean;
  }

  type IIndexedStore<T> = { [key: number]: T };
  type IIndexedDetailResponseStore<T> = IIndexedStore<IDetailResponseStore<T>>;

  interface IModulesStore {}

  interface IUserStore extends IUser {}

  interface IApplicationStore extends IModulesStore {
    readonly user: IUserStore;
    readonly dashboard: Dashboard.IStore;
    readonly budget: Budget.IStore;
  }

  namespace Dashboard {
    type ActionDomain = "trash" | "active";

    /* eslint-disable no-shadow */
    interface IAction<T = any> extends Redux.IAction<T> {
      readonly domain: ActionDomain;
    }

    interface IActiveBudgetsListStore extends IListResponseStore<IBudget> {
      readonly deleting: number[];
    }

    interface ITrashBudgetsListStore extends IListResponseStore<IBudget> {
      readonly deleting: number[];
      readonly restoring: number[];
    }

    interface IBudgetsStore {
      readonly active: IActiveBudgetsListStore;
      readonly trash: ITrashBudgetsListStore;
    }

    interface IStore {
      readonly budgets: IBudgetsStore;
    }
  }

  namespace Budget {
    /* eslint-disable no-shadow */
    interface IAction<T = any> extends Redux.IAction<T> {
      readonly budgetId?: number | undefined;
      readonly accountId?: number | undefined;
      readonly subaccountId?: number | undefined;
    }

    interface ISubAccountListStore {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ITableStore<ISubAccountRow, ISubAccount>;
    }

    interface ISubAccountStore {
      readonly detail: IDetailResponseStore<ISubAccount>;
      readonly subaccounts: ISubAccountListStore;
    }

    interface IAccountStore {
      readonly detail: IDetailResponseStore<IAccount>;
      readonly subaccounts: ISubAccountListStore;
    }

    interface IAccountsStore {
      readonly table: ITableStore<IAccountRow, IAccount>;
      readonly details: IIndexedStore<IAccountStore>;
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
    }

    interface IRow extends Redux.IRow {
      readonly selected: boolean;
      readonly isPlaceholder: boolean;
      readonly estimated: number | null;
      readonly subaccounts: ISimpleSubAccount[];
    }

    interface IAccountRow extends IRow {
      readonly account_number: string | null;
      readonly description: string | null;
    }

    interface ISubAccountRow extends IRow {
      readonly line: string | null;
      readonly name: string | null;
      readonly description: string | null;
      readonly quantity: number | null;
      readonly unit: Unit | null;
      readonly multiplier: number | null;
      readonly rate: number | null;
    }

    interface IStore {
      readonly budget: IDetailResponseStore<IBudget>;
      readonly accounts: IAccountsStore;
      readonly subaccounts: IIndexedStore<ISubAccountStore>;
      readonly ancestors: ListStore<IAncestor>;
      readonly ancestorsLoading: boolean;
    }
  }
}
