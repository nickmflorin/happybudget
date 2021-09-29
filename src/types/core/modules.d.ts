/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="../modeling/models.d.ts" />
/// <reference path="./redux.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Modules {

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
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Template>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
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

    type AccountOrSubAccountStore<D extends Model.HttpModel> = {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<D>;
      readonly comments: CommentsStore;
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
    }

    type SubAccountStore = AccountOrSubAccountStore<Model.SubAccount> & {
      readonly table: Tables.SubAccountTableStore;
    }

    type AccountStore = AccountOrSubAccountStore<Model.Account> & {
      readonly table: Tables.SubAccountTableStore;
    }

    /* eslint-disable no-shadow */
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly comments: CommentsStore;
      readonly history: Redux.ListResponseStore<Model.IFieldAlterationEvent>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
      readonly actuals: Tables.ActualTableStore;
      readonly headerTemplates: HeaderTemplatesStore;
      readonly commentsHistoryDrawerOpen: boolean;
    }
  }

  namespace Dashboard {
    /* eslint-disable no-shadow */
    interface Store {
      readonly budgets: Redux.ModelListResponseStore<Model.SimpleBudget>;
      readonly templates: Redux.ModelListResponseStore<Model.SimpleTemplate>;
      readonly community: Redux.ModelListResponseStore<Model.SimpleTemplate>;
    }
  }

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
    interface Store {
      readonly id: number | null;
      readonly detail: Redux.ModelDetailResponseStore<Model.Budget>;
      readonly subaccount: SubAccountStore;
      readonly account: AccountStore;
    }
  }
}
