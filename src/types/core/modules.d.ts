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

    interface SubAccountsStore<SA extends Model.Model, G extends Model.Group> extends Redux.ModelListResponseStore<SA> {
      readonly groups: Redux.ModelListResponseStore<G>;
      readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
    }

    interface AccountsStore<A extends Model.Model, G extends Model.Group> extends Redux.ModelListResponseStore<A> {
      readonly groups: Redux.ModelListResponseStore<G>;
    }

    interface SubAccountStore<
      SA extends Model.Model,
      G extends Model.Group,
      SASS extends Modules.Budgeting.SubAccountsStore<SA, G>
    > {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<SA>;
      readonly subaccounts: SASS;
    }

    interface AccountStore<
      A extends Model.Model,
      G extends Model.Group,
      SASS extends Modules.Budgeting.SubAccountsStore<SA, G>
    > {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<A>;
      readonly subaccounts: SASS;
    }

    interface BaseBudgetStore<M extends Model.Model> {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<M>;
    }

    interface BaseBudgetModuleStore<
      A extends Model.Model,
      SA extends Model.Model,
      G extends Model.Group,
      ASS extends Modules.Budgeting.AccountsStore<A, G>,
      SASS extends Modules.Budgeting.SubAccountsStore<SA, G>,
      AS extends Modules.Budgeting.AccountStore<A, G, SASS>,
      SAS extends Modules.Budgeting.SubACcountStore<SA, G, SASS>
    > {
      readonly autoIndex: boolean;
      readonly subaccount: SAS;
      readonly account: AS;
      readonly accounts: ASS;
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

      /* eslint-disable no-shadow */
      interface AccountsStore extends Modules.Budgeting.AccountsStore<Model.BudgetAccount, Model.BudgetGroup> {
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>;
      }

      /* eslint-disable no-shadow */
      interface SubAccountStore
        extends Modules.Budgeting.SubAccountStore<
          Model.BudgetSubAccount,
          Model.BudgetGroup,
          Modules.Budgeting.Budget.SubAccountsStore
        > {
        readonly comments: CommentsStore;
      }

      /* eslint-disable no-shadow */
      interface AccountStore
        extends Modules.Budgeting.AccountStore<
          Model.BudgetAccount,
          Model.BudgetGroup,
          Modules.Budgeting.Budget.SubAccountsStore
        > {
        readonly comments: CommentsStore;
      }

      interface BudgetStore extends Modules.Budgeting.BaseBudgetStore<Model.Budget> {
        readonly comments: CommentsStore;
      }

      interface Store
        extends Modules.Budgeting.BaseBudgetModuleStore<
          Model.BudgetAccount,
          Model.BudgetSubAccount,
          Model.BudgetGroup,
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
      interface AccountsStore extends Redux.ModelListResponseStore<Model.TemplateAccount> {
        readonly groups: Redux.ModelListResponseStore<Model.TemplateGroup>;
      }

      interface SubAccountsStore
        extends Modules.Budgeting.SubAccountsStore<Model.TemplateSubAccount, Model.TemplateGroup> {}

      interface SubAccountStore
        extends Modules.Budgeting.SubAccountStore<
          Model.TemplateSubAccount,
          Model.TemplateGroup,
          Modules.Budgeting.Template.SubAccountsStore
        > {}

      /* eslint-disable no-shadow */
      interface AccountStore
        extends Modules.Budgeting.AccountStore<
          Model.TemplateAccount,
          Model.TemplateGroup,
          Modules.Budgeting.Template.SubAccountsStore
        > {}

      interface TemplateStore extends Modules.Budgeting.BaseBudgetStore<Model.Template> {}

      interface Store
        extends Modules.Budgeting.BaseBudgetModuleStore<
          Model.TemplateAccount,
          Model.TemplateSubAccount,
          Model.TemplateGroup,
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
