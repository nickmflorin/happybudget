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

  type ModuleLabel = "dashboard" | "budgeting";

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

  interface ModulesStore {}

  namespace Dashboard {
    interface TemplatesStore extends Redux.ModelListResponseStore<Model.SimpleTemplate> {
      readonly duplicating: Redux.ModelListActionStore;
      readonly moving: Redux.ModelListActionStore;
      readonly deleting: Redux.ModelListActionStore;
    }

    interface CommunityTemplatesStore extends Redux.ModelListResponseStore<Model.SimpleTemplate> {
      readonly deleting: Redux.ModelListActionStore;
      readonly duplicating: Redux.ModelListActionStore;
      readonly showing: Redux.ModelListActionStore;
      readonly hiding: Redux.ModelListActionStore;
    }

    interface Store {
      readonly budgets: Redux.ModelListResponseStore<Model.SimpleBudget>;
      readonly templates: TemplatesStore;
      readonly contacts: Redux.ModelListResponseStore<Model.Contact>;
      readonly community: CommunityTemplatesStore;
    }
  }

  namespace Budgeting {
    type BudgetDirective = "Budget" | "Template";

    namespace Budget {
      interface CommentsStore extends Redux.ModelListResponseStore<Model.Comment> {
        readonly replying: number[];
      }

      interface SubAccountsStore extends Redux.ModelListResponseStore<Model.BudgetSubAccount> {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
        readonly groups: Redux.ModelListResponseStore<Model.BudgetGroup>;
        readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
      }

      interface AccountsStore extends Redux.ModelListResponseStore<Model.BudgetAccount> {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
        readonly groups: Redux.ModelListResponseStore<Model.BudgetGroup>;
      }

      interface SubAccountStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.BudgetSubAccount>;
        readonly subaccounts: SubAccountsStore;
        readonly comments: CommentsStore;
      }

      interface AccountStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.BudgetAccount>;
        readonly subaccounts: SubAccountsStore;
        readonly comments: CommentsStore;
      }

      interface BudgetStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
        readonly comments: CommentsStore;
      }

      interface Store {
        readonly autoIndex: boolean;
        readonly budget: BudgetStore;
        readonly instance: Model.BudgetAccount | Model.BudgetSubAccount | null;
        readonly commentsHistoryDrawerOpen: boolean;
        readonly budgetItems: Redux.ModelListResponseStore<Model.BudgetLineItem>;
        readonly budgetItemsTree: Redux.ModelListResponseStore<Model.TopTreeNode>;
        readonly actuals: Redux.ModelListResponseStore<Model.Actual>;
        readonly subaccount: SubAccountStore;
        readonly account: AccountStore;
        readonly accounts: AccountsStore;
        readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
      }
    }

    namespace Template {
      interface SubAccountsStore extends Redux.ModelListResponseStore<Model.TemplateSubAccount> {
        readonly groups: Redux.ModelListResponseStore<Model.TemplateGroup>;
        readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
      }

      interface AccountsStore extends Redux.ModelListResponseStore<Model.TemplateAccount> {
        readonly groups: Redux.ModelListResponseStore<Model.TemplateGroup>;
      }

      interface SubAccountStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.TemplateSubAccount>;
        readonly subaccounts: SubAccountsStore;
      }

      interface AccountStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.TemplateAccount>;
        readonly subaccounts: SubAccountsStore;
      }

      interface TemplateStore {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<Model.Template>;
      }

      interface Store {
        readonly autoIndex: boolean;
        readonly template: TemplateStore;
        readonly instance: Model.TemplateAccount | Model.TemplateSubAccount | null;
        readonly subaccount: SubAccountStore;
        readonly account: AccountStore;
        readonly accounts: AccountsStore;
        readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
      }
    }
    interface Store {
      readonly budget: Budget.Store;
      readonly template: Template.Store;
      readonly fringeColors: Redux.ListResponseStore<string>;
      readonly subaccountUnits: Redux.ModelListResponseStore<Model.Tag>;
    }
  }

  interface UserStore extends Model.User {}

  interface ApplicationStore extends ModulesStore {
    readonly user: UserStore;
    readonly dashboard: Dashboard.Store;
    readonly budgeting: Budgeting.Store;
    readonly drawerVisible: boolean;
    readonly loading: boolean;
  }
}
