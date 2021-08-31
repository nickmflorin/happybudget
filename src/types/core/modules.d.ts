/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./table.d.ts" />
/// <reference path="./redux.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Modules {

  namespace Authenticated {
    type ModuleLabel = "dashboard" | "budget";

    namespace Dashboard {
      /* eslint-disable no-shadow */
      interface StoreObj implements Redux.StoreObj  {
        readonly budgets: Redux.ModelListResponseStore<Model.SimpleBudget>;
        readonly templates: Redux.ModelListResponseStore<Model.SimpleTemplate>;
        readonly community: Redux.ModelListResponseStore<Model.SimpleTemplate>;
      }
    }

    namespace Budget {
      interface HeaderTemplatesStore extends Redux.ModelListResponseStore<Model.HeaderTemplate>  {
        readonly displayedTemplate: Model.HeaderTemplate | null;
        readonly loadingDetail: boolean;
      }

      interface CommentsStore extends Redux.ModelListResponseStore<Model.Comment>  {
        readonly replying: number[];
      }

      type AccountOrSubAccountStore<D extends Model.Model> = {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<D>;
        readonly comments: CommentsStore; // Not applicable for templates.
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>; // Not applicable for templates.
        readonly table: Redux.BudgetTableWithFringesStore<Model.SubAccount>;
      }

      type SubAccountStore = Modules.Authenticated.Budget.AccountOrSubAccountStore<Model.SubAccount>;
      type AccountStore = Modules.Authenticated.Budget.AccountOrSubAccountStore<Model.Account>;
      type BudgetStore<M extends Model.Budget | Model.Template> = {
        readonly id: number | null;
        readonly detail: Redux.ModelDetailResponseStore<M>;
        readonly comments: Modules.Authenticated.Budget.CommentsStore; // Not applicable for templates.
        readonly history: Redux.ModelListResponseStore<Model.IFieldAlterationEvent>; // Not applicable for templates.
        readonly table: Redux.BudgetTableStore<Model.Account>;
      };

      /* eslint-disable no-shadow */
      interface ModuleStore<M extends Model.Model>  {
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

      interface StoreObj implements Redux.StoreObj {
        readonly budget: Modules.Authenticated.Budget.ModuleStore<Model.Budget>;
        readonly template: Modules.Authenticated.Budget.ModuleStore<Model.Template>;
        readonly fringeColors: Redux.ListResponseStore<string>;
      }
    }

    interface UserStore extends Model.User {
      readonly contacts: Redux.TableStore<Model.Contact>;
    }

    type ModuleStore = Authenticated.Budget.StoreObj | Authenticated.Dashboard.StoreObj;
    interface ModulesReducer implements Modules.IModulesReducer<Authenticated.ModuleLabel, Authenticated.ModuleStore> {
      readonly dashboard: Redux.Reducer<Authenticated.Dashboard.StoreObj>;
      readonly budget: Redux.Reducer<Authenticated.Budget.StoreObj>;
    }
    interface ModulesStore implements Modules.IModulesStore<Authenticated.ModuleLabel> {
      readonly dashboard: Dashboard.StoreObj;
      readonly budget: Budget.StoreObj;
    }
    interface StoreObj extends GlobalStore, Authenticated.ModulesStore  {
      readonly user: UserStore;
      readonly subAccountUnits: Redux.ModelListResponseStore<Model.Tag>;
    }
    type ModuleConfig<S extends Budget.StoreObj | Dashboard.StoreObj = any> = Omit<_ModuleConfig<Authenticated.ModuleLabel, S>, "isUnauthenticated"> & {
      readonly isUnauthenticated?: false;
    };
    type ModuleConfigs = Array<ModuleConfig>;
  }

  namespace Unauthenticated {
    type ModuleLabel = "share";

    namespace Share {
      type AccountOrSubAccountStore<D extends Model.Model> = {
        readonly id: number | null;
        readonly detail: Redux.ReadOnlyModelDetailResponseStore<D>;
        readonly table: Redux.ReadOnlyBudgetTableWithFringesStore<Model.SubAccount>;
      }
      type SubAccountStore = Modules.Unauthenticated.Share.AccountOrSubAccountStore<Model.SubAccount>;
      type AccountStore = Modules.Unauthenticated.Share.AccountOrSubAccountStore<Model.Account>;
      type BudgetStore = {
        readonly id: number | null;
        readonly detail: Redux.ReadOnlyModelDetailResponseStore<Model.Budget>;
        readonly table: Redux.ReadOnlyBudgetTableStore<Model.Account>;
      };
      interface StoreObj implements Redux.StoreObj {
        readonly subaccount: SubAccountStore;
        readonly account: AccountStore;
        readonly budget: BudgetStore;
      }
    }

    type ModuleStore = Modules.Unauthenticated.Share.StoreObj;
    interface ModulesReducer implements Modules.IModulesReducer<Unauthenticated.ModuleLabel, Unauthenticated.ModuleStore> {
      readonly share: Redux.Reducer<Modules.Unauthenticated.Share.StoreObj>;
    }
    interface ModulesStore implements Modules.IModulesStore<Unauthenticated.ModuleLabel> {
      readonly share: Unauthenticated.Share.StoreObj;
    }
    interface StoreObj extends GlobalStore, Unauthenticated.ModulesStore  {
      readonly contacts: Redux.ReadOnlyTableStore<Model.Contact>;
      readonly subAccountUnits: Redux.ReadOnlyModelListResponseStore<Model.Tag>;
    }
    type ModuleConfig<S extends Modules.Unauthenticated.Share.StoreObj = any>  = Omit<_ModuleConfig<Modules.Unauthenticated.ModuleLabel, S>, "isUnauthenticated"> & {
      readonly isUnauthenticated: true;
    };
    type ModuleConfigs = Array<Modules.Unauthenticated.ModuleConfig>;
  }

  type ModuleConfig = Authenticated.ModuleConfig | Unauthenticated.ModuleConfig;
  type ModuleLabel = Authenticated.ModuleLabel | Unauthenticated.ModuleLabel;
  type ModulesStore = Authenticated.ModulesStore | Unauthenticated.ModulesStore;
  type ModulesReducer = Authenticated.ModulesReducer | Unauthenticated.ModulesReducer;
  type StoreObj = Authenticated.StoreObj | Unauthenticated.StoreObj;
  type ModuleConfigs = Array<Modules.Unauthenticated.ModuleConfig | Modules.Authenticated.ModuleConfig>;

  type ModulesSet<T extends ModuleLabel, P> = Record<T, P>;
  type IModulesStore<T extends ModuleLabel> = ModulesSet<T, Redux.StoreObj>;
  type IModulesReducer<T extends ModuleLabel, S extends Redux.StoreObj> = ModulesSet<T, Redux.Reducer<S>>;

  interface _ModuleConfig<T extends ModuleLabel, S extends Redux.StoreObj> {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: T;
    readonly isUnauthenticated?: boolean;
  }

  interface GlobalStore  {
    readonly drawerVisible: boolean;
    readonly loading: boolean;
  }
}
