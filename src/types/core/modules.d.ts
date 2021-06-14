/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />
/// <reference path="./redux.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Modules {
  interface ModuleStore {
    [key: string]: any;
  }

  type ModuleLabel = "dashboard" | "budgeting";

  interface ModuleConfig<S extends ModuleStore, A extends Redux.Action<any>> {
    readonly rootSaga?: Saga;
    readonly rootReducer: Reducer<S, A>;
    readonly initialState: S | (() => S);
    readonly label: Modules.ModuleLabel;
  }

  type ApplicationConfig = Modules.ModuleConfig<any, any>[];

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

    interface SubAccountsStore<SA, G extends Model.Group> extends Redux.ModelListResponseStore<SA> {
      readonly groups: Redux.ModelListResponseStore<G>;
      readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
    }

    namespace Budget {
      interface CommentsStore extends Redux.ModelListResponseStore<Model.Comment> {
        readonly replying: number[];
      }

      /* eslint-disable no-shadow */
      interface SubAccountsStore extends Modules.Budgeting.SubAccountsStore<Model.BudgetSubAccount, Model.BudgetGroup> {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
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
      interface AccountsStore extends Redux.ModelListResponseStore<Model.TemplateAccount> {
        readonly groups: Redux.ModelListResponseStore<Model.TemplateGroup>;
      }

      interface SubAccountsStore
        extends Modules.Budgeting.SubAccountsStore<Model.TemplateSubAccount, Model.TemplateGroup> {}

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
