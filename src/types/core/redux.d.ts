/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Redux {
  interface ModuleStore {
    [key: string]: any;
  }

  type ModuleLabel = "dashboard" | "budget";

  type SelectorFunc<T = any> = (state: Redux.ApplicationStore) => T;

  interface ActionConfig {
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: Redux.ModuleLabel | Redux.ModuleLabel[] | undefined;
  }

  interface Action<P = any> extends Action<string> {
    readonly type: string;
    readonly payload: P;
    readonly error?: Error | string | undefined;
    readonly meta?: any;
    readonly label?: Redux.ModuleLabel | Redux.ModuleLabel[] | undefined;
  }

  type ActionCreator<P = any, A extends Redux.Action<P> = Redux.Action<P>> = (
    type: string,
    payload?: P,
    options?: Redux.ActionConfig
  ) => A;

  interface ModuleConfig<S extends ModuleStore, A extends Redux.Action<any>> {
    readonly rootSaga?: Saga;
    readonly rootReducer: Reducer<S, A>;
    readonly initialState: S | (() => S);
    readonly label: Redux.ModuleLabel;
  }

  type ApplicationConfig = Redux.ModuleConfig<any, any>[];

  type ListStore<T> = T[];

  type ModelListActionPayload = { id: number; value: boolean };
  type ModelListActionInstance = { id: number; count: number };
  type ModelListActionStore = ModelListActionInstance[];

  interface UpdateModelActionPayload<M> {
    id: number;
    data: Partial<M>;
  }

  interface DetailResponseStore<T extends Model.Model> {
    readonly data: T | undefined;
    readonly loading: boolean;
    readonly responseWasReceived: boolean;
  }

  interface ListResponseStore<T extends Model.Model> {
    readonly data: T[];
    readonly count: number;
    readonly loading: boolean;
    readonly page: number;
    readonly pageSize: number;
    readonly search: string;
    readonly selected: number[];
    readonly responseWasReceived: boolean;
    readonly deleting: Redux.ModelListActionStore;
    readonly updating: Redux.ModelListActionStore;
    readonly creating: boolean;
  }

  interface CommentsListResponseStore extends Redux.ListResponseStore<Model.Comment> {
    readonly replying: number[];
  }

  type IndexedStore<T> = { [key: number]: T };
  type IndexedDetailResponseStore<T> = IndexedStore<DetailResponseStore<T>>;

  interface ModulesStore {}

  namespace Dashboard {
    type ActionDomain = "trash" | "active";

    /* eslint-disable no-shadow */
    interface Action<T = any> extends Redux.Action<T> {
      readonly domain: ActionDomain;
    }

    interface TrashBudgetsListStore extends Redux.ListResponseStore<Model.Budget> {
      readonly restoring: Redux.ModelListActionStore;
      readonly permanentlyDeleting: Redux.ModelListActionStore;
    }

    interface BudgetsStore {
      readonly active: Redux.ListResponseStore<Model.Budget>;
      readonly trash: TrashBudgetsListStore;
    }

    interface Store {
      readonly budgets: BudgetsStore;
      readonly contacts: Redux.ListResponseStore<Model.Contact>;
    }
  }

  namespace Budget {
    interface CommentsStore extends Redux.ListResponseStore<Model.Comment> {
      readonly replying: number[];
    }

    interface SubAccountsStore extends Redux.ListResponseStore<Model.SubAccount> {
      readonly placeholders: ListStore<Table.SubAccountRow>;
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
      readonly groups: Redux.ListResponseStore<Model.Group<Model.SimpleSubAccount>>;
      readonly fringes: FringesStore;
    }

    interface AccountsStore extends Redux.ListResponseStore<Model.Account> {
      readonly placeholders: ListStore<Table.AccountRow>;
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
      readonly groups: Redux.ListResponseStore<Model.Group<Model.SimpleAccount>>;
    }

    interface FringesStore extends Redux.ListResponseStore<Model.Fringe> {
      readonly placeholders: ListStore<Table.FringeRow>;
    }

    interface SubAccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.SubAccount>;
      readonly subaccounts: SubAccountsStore;
      readonly comments: CommentsStore;
    }

    interface AccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.Account>;
      readonly subaccounts: SubAccountsStore;
      readonly comments: CommentsStore;
    }

    interface BudgetStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.Budget>;
      readonly comments: CommentsStore;
    }

    interface ActualsStore extends Redux.ListResponseStore<Model.Actual> {
      readonly placeholders: ListStore<Table.ActualRow>;
    }

    interface Store {
      readonly budget: BudgetStore;
      readonly instance: Model.Account | Model.SubAccount | null;
      readonly commentsHistoryDrawerOpen: boolean;
      readonly budgetItems: Redux.ListResponseStore<Model.BudgetItem>;
      readonly budgetItemsTree: Redux.ListResponseStore<Model.BudgetItemTreeNode>;
      readonly actuals: ActualsStore;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: AccountsStore;
      readonly fringes: FringesStore;
    }
  }

  interface UserStore extends Model.User {}

  interface LoadingStore {
    readonly loading: boolean;
    readonly elements: string[];
  }

  interface ApplicationStore extends ModulesStore {
    readonly user: UserStore;
    readonly dashboard: Dashboard.Store;
    readonly budget: Budget.Store;
    readonly drawerVisible: boolean;
    readonly loading: LoadingStore;
  }
}
