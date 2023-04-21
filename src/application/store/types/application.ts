import { type Store as RootStore } from "redux";
import { type Saga } from "redux-saga";

import { Action } from "./actions";
import * as store from "./store";
import * as tabling from "./tabling";

import { type GenericSelectorFunc } from ".";

export type AccountOrSubAccountStore<
  M extends import("lib/model").Account | import("lib/model").SubAccount,
> = {
  readonly detail: store.ApiModelDetailStore<M>;
  readonly table: tabling.SubAccountTableStore;
};

export type SubAccountStore = AccountOrSubAccountStore<import("lib/model").SubAccount>;
export type AccountStore = AccountOrSubAccountStore<import("lib/model").Account>;

export type BudgetAnalysisStore = {
  readonly accounts: Omit<
    store.ApiModelListStore<import("lib/model").Account>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly groups: Omit<
    store.ApiModelListStore<import("lib/model").Group>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly actuals: Omit<
    store.ApiModelListStore<import("lib/model").Actual>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly loading: boolean;
  readonly responseWasReceived: boolean;
};

export interface BudgetStore {
  readonly detail: store.ApiModelDetailStore<import("lib/model").Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly actuals: tabling.ActualTableStore;
  readonly analysis: BudgetAnalysisStore;
  readonly fringes: tabling.FringeTableStore;
}

export interface TemplateStore {
  readonly detail: store.ApiModelDetailStore<import("lib/model").Template>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly fringes: tabling.FringeTableStore;
}

export interface DashboardStore {
  readonly budgets: store.AuthenticatedApiModelListStore<import("lib/model").SimpleBudget>;
  readonly archive: store.AuthenticatedApiModelListStore<import("lib/model").SimpleBudget>;
  readonly collaborating: store.AuthenticatedApiModelListStore<
    import("lib/model").SimpleCollaboratingBudget
  >;
  readonly templates: store.AuthenticatedApiModelListStore<import("lib/model").SimpleTemplate>;
  readonly community: store.AuthenticatedApiModelListStore<import("lib/model").SimpleTemplate>;
  readonly contacts: tabling.ContactTableStore;
}

export interface PublicBudgetStore {
  readonly detail: store.ApiModelDetailStore<import("lib/model").Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: tabling.AccountTableStore;
  readonly fringes: tabling.FringeTableStore;
}

export type BudgetStoreLookup<
  B extends import("lib/model").Budget | import("lib/model").Template =
    | import("lib/model").Budget
    | import("lib/model").Template,
  PUBLIC extends boolean = boolean,
> = [B, PUBLIC] extends [import("lib/model").Budget, true]
  ? PublicBudgetStore
  : [B, PUBLIC] extends [import("lib/model").Budget, false]
  ? BudgetStore
  : [B, PUBLIC] extends [import("lib/model").Template, false]
  ? TemplateStore
  : [B, PUBLIC] extends [import("lib/model").Budget | import("lib/model").Template, false]
  ? BudgetStore | TemplateStore
  : [B, PUBLIC] extends [import("lib/model").Budget, boolean]
  ? BudgetStore | PublicBudgetStore
  : [B, PUBLIC] extends [import("lib/model").Budget | import("lib/model").Template, boolean]
  ? BudgetStore | PublicBudgetStore | TemplateStore
  : never;

// export type PublicStore = config.PublicModuleStores & {
export type PublicStore = {
  readonly tokenId: string | null;
};

// export type ApplicationStore = config.AuthenticatedModuleStores & {
export type ApplicationStore = {
  readonly loading: boolean;
  readonly user: import("lib/model").User | null;
  readonly contacts: store.AuthenticatedApiModelListStore<import("lib/model").Contact>;
  readonly filteredContacts: store.AuthenticatedApiModelListStore<import("lib/model").Contact>;
  readonly actualTypes: store.ApiModelListStore<import("lib/model").ActualType>;
  readonly fringeColors: store.ListStore<string>;
  readonly subaccountUnits: store.ApiModelListStore<import("lib/model").SubAccountUnit>;
  readonly productPermissionModalOpen: boolean;
  readonly public: PublicStore;
  readonly drawerOpen: boolean;
};

export type ApplicationStoreSelectorFunc<T = unknown> = GenericSelectorFunc<ApplicationStore, T>;

export type StoreConfig = {
  readonly tokenId: string | null;
  readonly user: import("lib/model").User | null;
};

export type Store<S extends ApplicationStore> = RootStore<S, Action> & {
  readonly injectSaga: (key: string, saga: Saga) => boolean;
  readonly ejectSaga: (key: string) => boolean;
  readonly hasSaga: (key: string) => boolean;
};
