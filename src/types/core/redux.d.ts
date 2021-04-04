/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  interface IModuleStore {
    [key: string]: any;
  }

  type ModuleLabel = "dashboard" | "budget";

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
    readonly deleting: ListStore<number>;
    readonly updating: ListStore<number>;
    readonly creating: boolean;
  }

  interface ICommentsListResponseStore extends IListResponseStore<IComment> {
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

    interface ITrashBudgetsListStore extends IListResponseStore<IBudget> {
      readonly restoring: number[];
    }

    interface IBudgetsStore {
      readonly active: IListResponseStore<IBudget>;
      readonly trash: ITrashBudgetsListStore;
    }

    interface IStore {
      readonly budgets: IBudgetsStore;
      readonly contacts: IListResponseStore<IContact>;
    }
  }

  namespace Budget {
    interface ICommentsStore extends IListResponseStore<IComment> {
      readonly replying: number[];
    }

    interface ISubAccountsStore extends IListResponseStore<ISubAccount> {
      readonly placeholders: ListStore<Table.SubAccountRow>;
      readonly history: IListResponseStore<IFieldAlterationEvent>;
      readonly groups: IListResponseStore<IGroup<ISimpleSubAccount>>;
    }

    interface IAccountsStore extends IListResponseStore<IAccount> {
      readonly placeholders: ListStore<Table.AccountRow>;
      readonly history: IListResponseStore<IFieldAlterationEvent>;
      readonly groups: IListResponseStore<IGroup<ISimpleAccount>>;
    }

    interface IFringesStore extends IListResponseStore<IFringe> {
      readonly placeholders: ListStore<Table.FringeRow>;
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
      readonly id: number | null;
      readonly detail: IDetailResponseStore<IBudget>;
      readonly comments: ICommentsStore;
    }

    interface IActualsStore extends IListResponseStore<IActual> {
      readonly placeholders: ListStore<Table.ActualRow>;
    }

    interface IStore {
      readonly budget: IBudgetStore;
      readonly instance: IAccount | ISubAccount | null;
      readonly commentsHistoryDrawerOpen: boolean;
      readonly budgetItems: IListResponseStore<IBudgetItem>;
      readonly budgetItemsTree: IListResponseStore<IBudgetItemTreeNode>;
      readonly actuals: IActualsStore;
      readonly subaccount: ISubAccountStore;
      readonly account: IAccountStore;
      readonly accounts: IAccountsStore;
      readonly fringes: IFringesStore;
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
    readonly drawerVisible: boolean;
    readonly loading: ILoadingStore;
  }
}
