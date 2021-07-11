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
    type AccountStoreType = { type: "account" }
    type SubAccountStoreType = { type: "subaccount" }
    type StoreType = AccountStoreType | SubAccountStoreType;

    type SubAccountsStore = Redux.ModelListResponseStore<Model.SubAccount> & SubAccountStoreType & {
      // TODO: Move me to the SubAccountStore (singular).
      readonly groups: Redux.ModelListResponseStore<Model.Group>;
    }

    type AccountsStore = Redux.ModelListResponseStore<Model.Account> & AccountStoreType & {
      // TODO: Move me to the AccountStore (singular).
      readonly groups: Redux.ModelListResponseStore<Model.Group>;
    }

    type SubAccountStore<SASS extends Modules.Budgeting.SubAccountsStore> = SubAccountStoreType & {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.SubAccount>;
      readonly subaccounts: SASS;
      readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
    }

    type AccountStore<SASS extends Modules.Budgeting.SubAccountsStore> = AccountStoreType & {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Account>;
      readonly subaccounts: SASS;
      readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
    }

    interface BaseBudgetStore<M extends Model.Model> {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<M>;
    }

    interface BaseBudgetModuleStore<
      ASS extends Modules.Budgeting.AccountsStore,
      SASS extends Modules.Budgeting.SubAccountsStore,
      AS extends Modules.Budgeting.AccountStore<SASS>,
      SAS extends Modules.Budgeting.SubAccountStore<SASS>
    > {
      readonly autoIndex: boolean;
      readonly subaccount: SAS;
      readonly account: AS;
      readonly accounts: ASS;
    }

    namespace Budget {
      interface CommentsStore extends Redux.ModelListResponseStore<Model.Comment> {
        readonly replying: number[];
      }

      /* eslint-disable no-shadow */
      type SubAccountsStore = Modules.Budgeting.SubAccountsStore & {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
      }

      /* eslint-disable no-shadow */
      type AccountsStore = Modules.Budgeting.AccountsStore & {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
      }

      /* eslint-disable no-shadow */
      type SubAccountStore = Modules.Budgeting.SubAccountStore<Modules.Budgeting.Budget.SubAccountsStore> & {
        readonly comments: CommentsStore;
      }

      /* eslint-disable no-shadow */
      type AccountStore = Modules.Budgeting.AccountStore<Modules.Budgeting.Budget.SubAccountsStore> & {
        readonly comments: CommentsStore;
      }

      interface BudgetStore extends Modules.Budgeting.BaseBudgetStore<Model.Budget> {
        readonly comments: CommentsStore;
      }

      interface Store
        extends Modules.Budgeting.BaseBudgetModuleStore<
          Modules.Budgeting.Budget.AccountsStore,
          Modules.Budgeting.Budget.SubAccountsStore,
          Modules.Budgeting.Budget.AccountStore,
          Modules.Budgeting.Budget.SubAccountStore
        > {
        readonly budget: BudgetStore;
        readonly commentsHistoryDrawerOpen: boolean;
        readonly subAccountsTree: Redux.ModelListResponseStore<Model.SubAccountTreeNode>;
        readonly actuals: Redux.ModelListResponseStore<Model.Actual>;
      }
    }

    namespace Template {
      /* eslint-disable no-shadow */
      type AccountsStore = Modules.Budgeting.AccountsStore;

      /* eslint-disable no-shadow */
      type SubAccountsStore = Modules.Budgeting.SubAccountsStore;

      type SubAccountStore = Modules.Budgeting.SubAccountStore<Modules.Budgeting.Template.SubAccountsStore>;

      /* eslint-disable no-shadow */
      type AccountStore = Modules.Budgeting.AccountStore<Modules.Budgeting.Template.SubAccountsStore>;

      interface TemplateStore extends Modules.Budgeting.BaseBudgetStore<Model.Template> {}

      interface Store
        extends Modules.Budgeting.BaseBudgetModuleStore<
          Modules.Budgeting.Template.AccountsStore,
          Modules.Budgeting.Template.SubAccountsStore,
          Modules.Budgeting.Template.AccountStore,
          Modules.Budgeting.Template.SubAccountStore
        > {
        readonly template: TemplateStore;
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
