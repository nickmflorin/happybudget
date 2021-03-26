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

  type ModuleLabel = "dashboard" | "budget" | "actuals" | "calculator";

  type SelectorFunc<T = any> = (state: Redux.IApplicationStore) => T;

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
  interface UpdateModelActionPayload<M> {
    id: number;
    data: Partial<M>;
  }

  interface IDetailResponseStore<T extends Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
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

  interface ICommentsListResponseStore extends IListResponseStore<IComment> {
    readonly submitting: boolean;
    readonly deleting: number[];
    readonly editing: number[];
    readonly replying: number[];
  }

  type IIndexedStore<T> = { [key: number]: T };
  type IIndexedDetailResponseStore<T> = IIndexedStore<IDetailResponseStore<T>>;

  interface IModulesStore {}

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

    interface IContactsStore extends IListResponseStore<IContact> {
      readonly deleting: number[];
      readonly updating: number[];
      readonly creating: boolean;
    }

    interface IStore {
      readonly budgets: IBudgetsStore;
      readonly contacts: IContactsStore;
    }
  }

  namespace Calculator {
    interface ISubAccountGroupsStore {
      deleting: number[];
    }

    interface ICommentsStore extends IListResponseStore<IComment> {
      readonly submitting: boolean;
      readonly deleting: number[];
      readonly replying: number[];
      readonly editing: number[];
    }

    interface ISubAccountsStore extends IListResponseStore<ISubAccount> {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ListStore<Table.SubAccountRow>;
      readonly history: IListResponseStore<IFieldAlterationEvent>;
      readonly groups: ISubAccountGroupsStore;
    }

    interface IAccountsStore extends IListResponseStore<IAccount> {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ListStore<Table.AccountRow>;
      readonly history: IListResponseStore<IFieldAlterationEvent>;
    }

    interface ISubAccountStore {
      readonly id: number | null;
      readonly detail: IDetailResponseStore<ISubAccount>;
      readonly subaccounts: ISubAccountsStore;
      readonly comments: ICommentsStore;
    }

    interface IAccountStore {
      readonly id: number | null;
      readonly detail: IDetailResponseStore<IAccount>;
      readonly subaccounts: ISubAccountsStore;
      readonly comments: ICommentsStore;
    }

    interface IBudgetStore {
      readonly accounts: IAccountsStore;
      readonly comments: ICommentsStore;
    }

    interface IStore {
      readonly subaccount: ISubAccountStore;
      readonly account: IAccountStore;
      readonly budget: IBudgetStore;
    }
  }

  namespace Actuals {
    interface IActualsStore extends IListResponseStore<IActual> {
      readonly deleting: ListStore<number>;
      readonly updating: ListStore<number>;
      readonly creating: boolean;
      readonly table: ListStore<Table.ActualRow>;
    }

    interface IStore {
      readonly budgetItems: IListResponseStore<IBudgetItem>;
      readonly budgetItemsTree: IListResponseStore<IBudgetItemTreeNode>;
      readonly actuals: IActualsStore;
    }
  }

  namespace Budget {
    interface IBudgetStore {
      id: number | null;
      detail: IDetailResponseStore<IBudget>;
    }
    interface IStore {
      readonly budget: IBudgetStore;
      readonly ancestors: ListStore<IAncestor>;
      readonly ancestorsLoading: boolean;
      readonly commentsHistoryDrawerOpen: boolean;
    }
  }

  interface IUserStore extends IUser {}

  interface ILoadingStore {
    readonly loading: boolean;
    readonly elements: string[];
  }

  interface IApplicationStore extends IModulesStore {
    readonly user: IUserStore;
    readonly dashboard: Dashboard.IStore;
    readonly budget: Budget.IStore;
    readonly calculator: Calculator.IStore;
    readonly actuals: Actuals.IStore;
    readonly drawerVisible: boolean;
    readonly loading: ILoadingStore;
  }
}
