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

  type ModuleLabel = "dashboard" | "budget";

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
      readonly community: CommunityTemplatesStore;
    }
  }

  namespace Budget {
    interface HeaderTemplatesStore extends Redux.ModelListResponseStore<Model.HeaderTemplate> {
      readonly displayedTemplate: Model.HeaderTemplate | null;
      readonly loadingDetail: boolean;
    }

    interface CommentsStore extends Redux.ModelListResponseStore<Model.Comment> {
      readonly replying: number[];
    }

    type AccountSubAccountStore<M extends Model.Account | Model.SubAccount> = {
      readonly id: number | null;
      readonly table: Redux.BudgetTableStore<Model.SubAccount>;
      readonly detail: Redux.ModelDetailResponseStore<M>;
      readonly fringes: Redux.ModelListResponseStore<Model.Fringe>;
      readonly comments: CommentsStore; // Not applicable for templates.
      readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>; // Not applicable for templates.
    }

    type SubAccountStore = Modules.Budget.AccountSubAccountStore<Model.SubAccount>;
    type AccountStore = Modules.Budget.AccountSubAccountStore<Model.Account>;

    interface BudgetStore<M extends Model.Model> {
      readonly id: number | null;
      readonly table: Redux.BudgetTableStore<Model.Account>;
      readonly detail: Redux.ModelDetailResponseStore<M>;
      readonly comments: CommentsStore; // Not applicable for templates.
      readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>; // Not applicable for templates.
    }

    /* eslint-disable no-shadow */
    interface ModuleStore<M extends Model.Model> {
      readonly autoIndex: boolean;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly budget: BudgetStore<M>;
      // Not applicable for templates.
      readonly headerTemplates: HeaderTemplatesStore;
      readonly commentsHistoryDrawerOpen: boolean;
      readonly subAccountsTree: Redux.ModelListResponseStore<Model.SubAccountTreeNode>;
      readonly actuals: Redux.ModelListResponseStore<Model.Actual>;
    }

    interface Store {
      readonly budget: Modules.Budget.ModuleStore<Model.Budget>;
      readonly template: Modules.Budget.ModuleStore<Model.Template>;
      readonly fringeColors: Redux.ListResponseStore<string>;
      readonly subaccountUnits: Redux.ModelListResponseStore<Model.Tag>;
    }
  }

  interface UserStore extends Model.User {
    readonly contacts: Redux.TableStore<Model.Contact>;
  }

  interface ApplicationStore extends ModulesStore {
    readonly user: UserStore;
    readonly dashboard: Dashboard.Store;
    readonly budget: Budget.Store;
    readonly drawerVisible: boolean;
    readonly loading: boolean;
  }
}
