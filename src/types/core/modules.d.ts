/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="../modeling/models.d.ts" />
/// <reference path="./redux.d.ts" />

/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Modules {

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  namespace Template {
    type AccountOrSubAccountStore<D extends Model.HttpModel> = {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<D>;
    }

    type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount> & {
      readonly table: Tables.SubAccountTableStore;
    }

    type AccountStore = AccountOrSubAccountStore<Model.Account> & {
      readonly table: Tables.SubAccountTableStore;
    }

    /* eslint-disable no-shadow */
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Template>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
    }
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  namespace Budget {
    interface HeaderTemplatesStore extends Redux.AuthenticatedModelListResponseStore<Model.HeaderTemplate> {
      readonly displayedTemplate: Model.HeaderTemplate | null;
      readonly loadingDetail: boolean;
    }

    type AccountOrSubAccountStore<D extends Model.HttpModel> = {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<D>;
    }

    type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount> & {
      readonly table: Tables.SubAccountTableStore;
    }

    type AccountStore = AccountOrSubAccountStore<Model.Account> & {
      readonly table: Tables.SubAccountTableStore;
    }

    /* eslint-disable no-shadow */
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly actuals: Tables.ActualTableStore;
      readonly headerTemplates: HeaderTemplatesStore;
    }
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  namespace Dashboard {
    /* eslint-disable no-shadow */
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    interface Store {
      readonly budgets: Redux.AuthenticatedModelListResponseStore<Model.SimpleBudget>;
      readonly templates: Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>;
      readonly community: Redux.AuthenticatedModelListResponseStore<Model.SimpleTemplate>;
    }
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  namespace Share {
    type AccountOrSubAccountStore<D extends Model.HttpModel> = {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<D>;
    }

    type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount> & {
      readonly table: Tables.SubAccountTableStore;
    }

    type AccountStore = AccountOrSubAccountStore<Model.Account> & {
      readonly table: Tables.SubAccountTableStore;
    }

    /* eslint-disable no-shadow */
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
    }
  }
}
