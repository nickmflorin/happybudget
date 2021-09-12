
/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="../modeling/models.d.ts" />
/// <reference path="./redux.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Application {

  type Config = {
    readonly reportWebVitals: boolean;
    readonly tableDebug: boolean;
    readonly whyDidYouRender: boolean;
  };

  type ConfigOption = {
    readonly devOnly?: boolean;
    readonly name: keyof Config;
    readonly default?: boolean;
  }

  namespace Authenticated {
    type ModuleLabel = "dashboard" | "budget" | "template";
    type AnyModuleStore = Modules.Budget.Store | Modules.Dashboard.Store | Modules.Template.Store;
    type ModuleStores = {
      readonly dashboard: Modules.Dashboard.Store;
      readonly budget: Modules.Budget.Store;
      readonly template: Modules.Template.Store;
    }
    type ModuleReducers = Redux.ReducersMapObject<ModuleStores>;

    type StaticStores = ModuleStores & {
      readonly drawerVisible: boolean;
      readonly loading: boolean;
      readonly user: Model.User;
      readonly contacts: Redux.ModelListResponseStore<Model.Contact>;
    }
    type StaticReducers = Redux.ReducersMapObject<StaticStores>;

    type Store = StaticStores & Redux.AsyncStores<Redux.TableStore>;
    type Reducers = Redux.ReducersMapObject<Store>;

    type ModuleConfig<S extends AnyModuleStore = any> = Omit<
      Application.ModuleConfig<ModuleLabel, S>,
      "isUnauthenticated"
    > & {
      readonly isUnauthenticated?: false;
    };
  }

  namespace Unauthenticated {
    type ModuleLabel = "share";
    type AnycModuleStore = Modules.Share.Store;
    type ModuleStores = {
      readonly share: Modules.Share.Store;
    }
    type ModuleReducers = Redux.ReducersMapObject<ModuleStores>;

    type StaticStores = ModuleStores & {
      readonly drawerVisible: boolean;
      readonly loading: boolean;
      readonly contacts: Redux.ListResponseStore<Model.Contact>;
    }
    type StaticReducers = Redux.ReducersMapObject<StaticStores>;

    type Store = StaticStores & Redux.AsyncStores<Redux.TableStore>;
    type Reducers = Redux.ReducersMapObject<Store>;

    type ModuleConfig<S extends Modules.Share.Store = any> = Omit<
      Application.ModuleConfig<ModuleLabel, S>,
      "isUnauthenticated"
    > & {
      readonly isUnauthenticated: true;
    };
  }

  type AnyModuleLabel = Authenticated.ModuleLabel | Unauthenticated.ModuleLabel;

  interface ModuleConfig<L extends AnyModuleLabel, S extends Redux.StoreObj> {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: L;
    readonly isUnauthenticated?: boolean;
  }

  type AnyModuleConfig = Authenticated.ModuleConfig | Unauthenticated.ModuleConfig;
  type ModuleStores = Authenticated.ModuleStores | Unauthenticated.ModuleStores;
  type ModuleReducers = Authenticated.ModuleReducers | Unauthenticated.ModuleReducers;
  type StaticReducers = Authenticated.StaticReducers | Unauthenticated.StaticReducers;
  type StaticStores = Authenticated.StaticStores | Unauthenticated.StaticStores;
  type Store = Authenticated.Store | Unauthenticated.Store;
  type Reducers = Authenticated.Reducers | Unauthenticated.Reducers;
}
