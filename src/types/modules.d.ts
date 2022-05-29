declare namespace Modules {
  type AccountOrSubAccountStore<M extends Model.Account | Model.SubAccount> = {
    readonly detail: Redux.ModelDetailStore<M>;
    readonly table: Tables.SubAccountTableStore;
  };

  type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount>;
  type AccountStore = AccountOrSubAccountStore<Model.Account>;

  namespace Template {
    interface Store {
      readonly detail: Redux.ModelDetailStore<Model.Template>;
      readonly subaccount: Redux.ModelIndexedStore<SubAccountStore>;
      readonly account: Redux.ModelIndexedStore<AccountStore>;
      readonly accounts: Tables.AccountTableStore;
      readonly fringes: Tables.FringeTableStore;
    }
  }

  namespace Budget {
    type AnalysisStore = {
      readonly accounts: Omit<
        Redux.ModelListStore<Model.Account>,
        "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
      >;
      readonly groups: Omit<
        Redux.ModelListStore<Model.Group>,
        "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
      >;
      readonly actuals: Omit<
        Redux.ModelListStore<Model.Actual>,
        "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
      >;
      readonly loading: boolean;
      readonly responseWasReceived: boolean;
    };

    interface Store {
      readonly detail: Redux.ModelDetailStore<Model.Budget>;
      readonly subaccount: Redux.ModelIndexedStore<SubAccountStore>;
      readonly account: Redux.ModelIndexedStore<AccountStore>;
      readonly accounts: Tables.AccountTableStore;
      readonly actuals: Tables.ActualTableStore;
      readonly analysis: AnalysisStore;
      readonly fringes: Tables.FringeTableStore;
    }
  }

  namespace Dashboard {
    interface Store {
      readonly budgets: Redux.AuthenticatedModelListStore<Model.SimpleBudget>;
      readonly archive: Redux.AuthenticatedModelListStore<Model.SimpleBudget>;
      readonly collaborating: Redux.AuthenticatedModelListStore<Model.SimpleCollaboratingBudget>;
      readonly templates: Redux.AuthenticatedModelListStore<Model.SimpleTemplate>;
      readonly community: Redux.AuthenticatedModelListStore<Model.SimpleTemplate>;
      readonly contacts: Tables.ContactTableStore;
    }
  }

  namespace PublicBudget {
    interface Store {
      readonly detail: Redux.ModelDetailStore<Model.Budget>;
      readonly subaccount: Redux.ModelIndexedStore<SubAccountStore>;
      readonly account: Redux.ModelIndexedStore<AccountStore>;
      readonly accounts: Tables.AccountTableStore;
      readonly fringes: Tables.FringeTableStore;
    }
  }

  type BudgetStoreLookup<
    B extends Model.Budget | Model.Template = Model.Budget | Model.Template,
    PUBLIC extends boolean = boolean
  > = [B, PUBLIC] extends [Model.Budget, true]
    ? Modules.PublicBudget.Store
    : [B, PUBLIC] extends [Model.Budget, false]
    ? Modules.Budget.Store
    : [B, PUBLIC] extends [Model.Template, false]
    ? Modules.Template.Store
    : [B, PUBLIC] extends [Model.Budget | Model.Template, false]
    ? Modules.Budget.Store | Modules.Template.Store
    : [B, PUBLIC] extends [Model.Budget, boolean]
    ? Modules.Budget.Store | Modules.PublicBudget.Store
    : [B, PUBLIC] extends [Model.Budget | Model.Template, boolean]
    ? Modules.Budget.Store | Modules.PublicBudget.Store | Modules.Template.Store
    : never;
}
