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

  type ModuleLabel = "dashboard" | "budget" | "template";

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
    payload: P,
    options?: Redux.ActionConfig | undefined
  ) => A;

  type Task<P = any, A extends Redux.Action<P> = Redux.Action<P>> = (action: A) => SagaIterator;

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
    readonly objLoading: Redux.ModelListActionStore;
    readonly creating: boolean;
  }

  interface CommentsListResponseStore extends Redux.ListResponseStore<Model.Comment> {
    readonly replying: number[];
  }

  type IndexedStore<T> = { [key: number]: T };
  type IndexedDetailResponseStore<T> = IndexedStore<DetailResponseStore<T>>;

  interface ModulesStore {}

  namespace Dashboard {
    interface TemplatesStore extends Redux.ListResponseStore<Model.SimpleTemplate> {
      readonly duplicating: Redux.ModelListActionStore;
      readonly moving: Redux.ModelListActionStore;
      readonly deleting: Redux.ModelListActionStore;
    }

    interface CommunityTemplatesStore extends Redux.ListResponseStore<Model.SimpleTemplate> {
      readonly deleting: Redux.ModelListActionStore;
      readonly duplicating: Redux.ModelListActionStore;
    }

    interface Store {
      readonly budgets: Redux.ListResponseStore<Model.SimpleBudget>;
      readonly templates: TemplatesStore;
      readonly contacts: Redux.ListResponseStore<Model.Contact>;
      readonly community: CommunityTemplatesStore;
    }
  }

  type BudgetDirective = "Budget" | "Template";

  namespace Budget {
    interface CommentsStore extends Redux.ListResponseStore<Model.Comment> {
      readonly replying: number[];
    }

    interface FringesStore extends Redux.ListResponseStore<Model.Fringe> {
      readonly placeholders: ListStore<Table.FringeRow>;
    }

    interface SubAccountsStore extends Redux.ListResponseStore<Model.BudgetSubAccount> {
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
      readonly groups: Redux.ListResponseStore<Model.BudgetGroup>;
      readonly fringes: FringesStore;
    }

    interface AccountsStore extends Redux.ListResponseStore<Model.BudgetAccount> {
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
      readonly groups: Redux.ListResponseStore<Model.BudgetGroup>;
    }

    interface SubAccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.BudgetSubAccount>;
      readonly subaccounts: SubAccountsStore;
      readonly comments: CommentsStore;
    }

    interface AccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.BudgetAccount>;
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
      readonly instance: Model.BudgetAccount | Model.BudgetSubAccount | null;
      readonly commentsHistoryDrawerOpen: boolean;
      readonly budgetItems: Redux.ListResponseStore<Model.BudgetLineItem>;
      readonly budgetItemsTree: Redux.ListResponseStore<Model.TopTreeNode>;
      readonly actuals: ActualsStore;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: AccountsStore;
      readonly fringes: FringesStore;
    }
  }

  namespace Template {
    interface FringesStore extends Redux.ListResponseStore<Model.Fringe> {
      readonly placeholders: ListStore<Table.FringeRow>;
    }

    interface SubAccountsStore extends Redux.ListResponseStore<Model.TemplateSubAccount> {
      readonly groups: Redux.ListResponseStore<Model.TemplateGroup>;
      readonly fringes: FringesStore;
    }

    interface AccountsStore extends Redux.ListResponseStore<Model.TemplateAccount> {
      readonly groups: Redux.ListResponseStore<Model.TemplateGroup>;
    }

    interface SubAccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.TemplateSubAccount>;
      readonly subaccounts: SubAccountsStore;
    }

    interface AccountStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.TemplateAccount>;
      readonly subaccounts: SubAccountsStore;
    }

    interface TemplateStore {
      readonly id: number | null;
      readonly detail: Redux.DetailResponseStore<Model.Template>;
    }

    interface Store {
      readonly template: TemplateStore;
      readonly instance: Model.TemplateAccount | Model.TemplateSubAccount | null;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: AccountsStore;
      readonly fringes: FringesStore;
    }
  }

  interface UserStore extends Model.User {}

  interface ApplicationStore extends ModulesStore {
    readonly user: UserStore;
    readonly dashboard: Dashboard.Store;
    readonly budget: Budget.Store;
    readonly template: Template.Store;
    readonly drawerVisible: boolean;
    readonly loading: boolean;
  }
}
