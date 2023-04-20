import { type Store as RootStore } from "redux";
import { type Saga } from "redux-saga";

import { model } from "lib";

import * as config from "../../config";

import { Action } from "./actions";
import * as store from "./store";
import * as tabling from "./tabling";

import { type GenericSelectorFunc } from ".";

export type AccountOrSubAccountStore<M extends model.Account | model.SubAccount> = {
  readonly detail: store.ApiModelDetailStore<M>;
  readonly table: tabling.SubAccountTableStore;
};

export type SubAccountStore = AccountOrSubAccountStore<model.SubAccount>;
export type AccountStore = AccountOrSubAccountStore<model.Account>;

export type BudgetAnalysisStore = {
  readonly accounts: Omit<
    store.ApiModelListStore<model.Account>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly groups: Omit<
    store.ApiModelListStore<model.Group>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly actuals: Omit<
    store.ApiModelListStore<model.Actual>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly loading: boolean;
  readonly responseWasReceived: boolean;
};

export interface BudgetStore {
  readonly detail: store.ApiModelDetailStore<model.Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly actuals: tabling.ActualTableStore;
  readonly analysis: BudgetAnalysisStore;
  readonly fringes: tabling.FringeTableStore;
}

export interface TemplateStore {
  readonly detail: store.ApiModelDetailStore<model.Template>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly fringes: tabling.FringeTableStore;
}

export interface DashboardStore {
  readonly budgets: store.AuthenticatedApiModelListStore<model.SimpleBudget>;
  readonly archive: store.AuthenticatedApiModelListStore<model.SimpleBudget>;
  readonly collaborating: store.AuthenticatedApiModelListStore<model.SimpleCollaboratingBudget>;
  readonly templates: store.AuthenticatedApiModelListStore<model.SimpleTemplate>;
  readonly community: store.AuthenticatedApiModelListStore<model.SimpleTemplate>;
  readonly contacts: tabling.ContactTableStore;
}

export interface PublicBudgetStore {
  readonly detail: store.ApiModelDetailStore<model.Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly fringes: tabling.FringeTableStore;
}

export type BudgetStoreLookup<
  B extends model.Budget | model.Template = model.Budget | model.Template,
  PUBLIC extends boolean = boolean,
> = [B, PUBLIC] extends [model.Budget, true]
  ? PublicBudgetStore
  : [B, PUBLIC] extends [model.Budget, false]
  ? BudgetStore
  : [B, PUBLIC] extends [model.Template, false]
  ? TemplateStore
  : [B, PUBLIC] extends [model.Budget | model.Template, false]
  ? BudgetStore | TemplateStore
  : [B, PUBLIC] extends [model.Budget, boolean]
  ? BudgetStore | PublicBudgetStore
  : [B, PUBLIC] extends [model.Budget | model.Template, boolean]
  ? BudgetStore | PublicBudgetStore | TemplateStore
  : never;

export type PublicStore = config.PublicModuleStores & {
  readonly tokenId: string | null;
};

export type ApplicationStore = config.AuthenticatedModuleStores & {
  readonly loading: boolean;
  readonly user: model.User | null;
  readonly contacts: store.AuthenticatedApiModelListStore<model.Contact>;
  readonly filteredContacts: store.AuthenticatedApiModelListStore<model.Contact>;
  readonly actualTypes: store.ApiModelListStore<model.ActualType>;
  readonly fringeColors: store.ListStore<string>;
  readonly subaccountUnits: store.ApiModelListStore<model.SubAccountUnit>;
  readonly productPermissionModalOpen: boolean;
  readonly public: PublicStore;
  readonly drawerOpen: boolean;
};

export type ApplicationStoreSelectorFunc<T = unknown> = GenericSelectorFunc<ApplicationStore, T>;

export type StoreConfig = {
  readonly tokenId: string | null;
  readonly user: model.User | null;
};

export type Store<S extends ApplicationStore> = RootStore<S, Action> & {
  readonly injectSaga: (key: string, saga: Saga) => boolean;
  readonly ejectSaga: (key: string) => boolean;
  readonly hasSaga: (key: string) => boolean;
};
