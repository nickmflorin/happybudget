/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./main.d.ts" />
/// <reference path="./table.d.ts" />

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

    interface ISubAccountStore {
      readonly detail: IDetailResponseStore<ISubAccount>;
      readonly subaccounts: ISubAccountListStore;
    }

    interface IAccountStore {
      readonly detail: IDetailResponseStore<IAccount>;
      readonly subaccounts: ISubAccountListStore;
    }

    interface ISubAccountsStore {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ITableStore<ISubAccountRow, ISubAccount>;
    }

    interface IActualsStore {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ITableStore<IActualRow, IActual>;
    }

    interface IAccountsStore {
      readonly table: ITableStore<IAccountRow, IAccount>;
      readonly details: IIndexedStore<IAccountStore>;
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
    }

    type AccountRowField = "account_number" | "description";
    type AccountCellError = ICellError<AccountRowField>;

    type SubAccountRowField = "line" | "name" | "description" | "quantity" | "unit" | "multiplier" | "rate";
    type SubAccountCellError = ICellError<SubAccountRowField>;

    type ActualRowField =
      | "parent"
      | "description"
      | "vendor"
      | "purchase_order"
      | "date"
      | "payment_method"
      | "payment_id"
      | "value";
    type ActualCellError = ICellError<ActualRowField>;

    interface IActivatePlaceholderPayload {
      oldId: number;
      id: number;
    }

    interface IBudgetRowMeta extends IRowMeta {
      readonly isPlaceholder: boolean;
      readonly subaccounts: ISimpleSubAccount[];
    }

    interface IActualRowMeta extends IRowMeta {
      readonly isPlaceholder: boolean;
    }

    interface IAccountRow extends IRow<AccountRowField, IBudgetRowMeta> {
      readonly account_number: ICell<string | null>;
      readonly description: ICell<string | null>;
      readonly estimated: ICell<number | null>;
      readonly variance: ICell<number | null>;
    }

    interface ISubAccountRow extends IRow<SubAccountRowField, IBudgetRowMeta> {
      readonly line: ICell<string | null>;
      readonly name: ICell<string | null>;
      readonly description: ICell<string | null>;
      readonly quantity: ICell<number | null>;
      readonly unit: ICell<Unit | null>;
      readonly multiplier: ICell<number | null>;
      readonly rate: ICell<number | null>;
      readonly estimated: ICell<number | null>;
      readonly variance: ICell<number | null>;
    }

    interface IActualRow extends IRow<ActualRowField, IActualRowMeta> {
      readonly parent: ICell<number | null>;
      readonly description: ICell<string | null>;
      readonly vendor: ICell<string | null>;
      readonly purchase_order: ICell<string | null>;
      readonly date: ICell<string | null>;
      readonly payment_method: ICell<PaymentMethod | null>;
      readonly payment_id: ICell<string | null>;
      readonly value: ICell<string | null>;
    }

    interface IStore {
      readonly budget: IDetailResponseStore<IBudget>;
      readonly accounts: IAccountsStore;
      readonly subaccounts: IIndexedStore<ISubAccountStore>;
      readonly ancestors: ListStore<IAncestor>;
      readonly ancestorsLoading: boolean;
      readonly actuals: IActualsStore;
    }
  }
}
