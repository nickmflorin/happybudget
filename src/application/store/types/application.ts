import { type Store as RootStore } from "redux";
import { type Saga } from "redux-saga";

import { enumeratedLiterals, EnumeratedLiteralType, model } from "lib";

import { Action } from "./actions";
import * as reducers from "./reducers";
import * as store from "./store";

import { type GenericSelectorFunc } from ".";

export const ModuleLabels = enumeratedLiterals(["dashboard", "budget", "template"] as const);
export type ModuleLabel = EnumeratedLiteralType<typeof ModuleLabels>;

type AccountOrSubAccountStore<M extends model.Account | model.SubAccount> = {
  readonly detail: store.ModelDetailStore<M>;
  readonly table: store.SubAccountTableStore;
};

type SubAccountStore = AccountOrSubAccountStore<model.SubAccount>;
type AccountStore = AccountOrSubAccountStore<model.Account>;

export type BudgetAnalysisStore = {
  readonly accounts: Omit<
    store.ModelListStore<model.Account>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly groups: Omit<
    store.ModelListStore<model.Group>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly actuals: Omit<
    store.ModelListStore<model.Actual>,
    "loading" | "responseWasReceived" | "error" | "query" | "invalidated"
  >;
  readonly loading: boolean;
  readonly responseWasReceived: boolean;
};

export interface BudgetStore {
  readonly detail: store.ModelDetailStore<model.Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: store.AccountTableStore;
  readonly actuals: store.ActualTableStore;
  readonly analysis: BudgetAnalysisStore;
  readonly fringes: store.FringeTableStore;
}

export interface TemplateStore {
  readonly detail: store.ModelDetailStore<model.Template>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: store.AccountTableStore;
  readonly fringes: store.FringeTableStore;
}

export interface DashboardStore {
  readonly budgets: store.AuthenticatedModelListStore<model.SimpleBudget>;
  readonly archive: store.AuthenticatedModelListStore<model.SimpleBudget>;
  readonly collaborating: store.AuthenticatedModelListStore<model.SimpleCollaboratingBudget>;
  readonly templates: store.AuthenticatedModelListStore<model.SimpleTemplate>;
  readonly community: store.AuthenticatedModelListStore<model.SimpleTemplate>;
  readonly contacts: store.ContactTableStore;
}

export interface PublicBudgetStore {
  readonly detail: store.ModelDetailStore<model.Budget>;
  readonly subaccount: store.ModelIndexedStore<SubAccountStore>;
  readonly account: store.ModelIndexedStore<AccountStore>;
  readonly accounts: store.AccountTableStore;
  readonly fringes: store.FringeTableStore;
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

export type AnyModuleStore = BudgetStore | DashboardStore | TemplateStore | PublicBudgetStore;

export type PublicModuleStores = {
  readonly budget: PublicBudgetStore;
};

export type AuthenticatedModuleStores = {
  readonly dashboard: DashboardStore;
  readonly budget: BudgetStore;
  readonly template: TemplateStore;
};

export type PublicModuleReducers = reducers.ReducersMapObject<PublicModuleStores>;
export type AuthenticatedModuleReducers = reducers.ReducersMapObject<AuthenticatedModuleStores>;

export type PublicStore = PublicModuleStores & {
  readonly tokenId: string | null;
};

export type ApplicationStore = AuthenticatedModuleStores & {
  readonly loading: boolean;
  readonly user: model.User | null;
  readonly contacts: store.AuthenticatedModelListStore<model.Contact>;
  readonly filteredContacts: store.AuthenticatedModelListStore<model.Contact>;
  readonly actualTypes: store.ModelListStore<model.Tag>;
  readonly fringeColors: store.ListStore<string>;
  readonly subaccountUnits: store.ModelListStore<model.Tag>;
  readonly productPermissionModalOpen: boolean;
  readonly public: PublicStore;
  readonly drawerOpen: boolean;
};

export type ApplicationStoreSelectorFunc<T = unknown> = GenericSelectorFunc<ApplicationStore, T>;

export interface ModuleConfig<
  S extends
    | PublicModuleStores[keyof PublicModuleStores]
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    | AuthenticatedModuleStores[keyof AuthenticatedModuleStores] = any,
> {
  readonly rootSaga?: Saga;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly rootReducer: reducers.Reducer<S, any>;
  readonly initialState: S | (() => S);
  readonly label: ModuleLabel;
  readonly isPublic?: boolean;
}

export type StoreConfig = {
  readonly tokenId: string | null;
  readonly user: model.User | null;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly modules: ModuleConfig<any>[];
};

export type Store<S extends ApplicationStore> = RootStore<S, Action> & {
  readonly injectSaga: (key: string, saga: Saga) => boolean;
  readonly ejectSaga: (key: string) => boolean;
  readonly hasSaga: (key: string) => boolean;
};
