declare namespace Modules {
  type AccountOrSubAccountStore<D extends Model.HttpModel> = {
    readonly detail: Redux.ModelDetailResponseStore<D>;
  };

  type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount> & {
    readonly table: Tables.SubAccountTableStore;
  };

  type AccountStore = AccountOrSubAccountStore<Model.Account> & {
    readonly table: Tables.SubAccountTableStore;
  };

  namespace Template {
    interface Store {
      readonly detail: Redux.ModelDetailResponseStore<Model.Template>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: Tables.AccountTableStore;
    }
  }

  namespace Budget {
    type AnalysisStore = {
      readonly accounts: Omit<Redux.ModelListResponseStore<Model.Account>, "loading" | "responseWasReceived">;
      readonly groups: Omit<Redux.ModelListResponseStore<Model.Group>, "loading" | "responseWasReceived">;
      readonly actuals: Omit<Redux.ModelListResponseStore<Model.Actual>, "loading" | "responseWasReceived">;
      readonly loading: boolean;
      readonly responseWasReceived: boolean;
    };

    interface Store {
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: Tables.AccountTableStore;
      readonly actuals: Tables.ActualTableStore;
      readonly analysis: AnalysisStore;
    }
  }

  namespace Dashboard {
    interface Store {
      readonly budgets: Redux.AuthenticatedModelListResponseStore<Model.SimpleBudget>;
      readonly archive: Redux.AuthenticatedModelListResponseStore<Model.SimpleBudget>;
      readonly collaborating: Redux.AuthenticatedModelListResponseStore<Model.SimpleCollaboratingBudget>;
      readonly templates: Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>;
      readonly community: Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>;
      readonly contacts: Tables.ContactTableStore;
    }
  }

  namespace PublicBudget {
    interface Store {
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly accounts: Tables.AccountTableStore;
    }
  }
}
