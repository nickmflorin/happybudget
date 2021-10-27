
/// <reference path="redux/index.d.ts" />
/// <reference path="redux-sagas/index.d.ts" />
/// <reference path="../modeling/models.d.ts" />
/// <reference path="./redux.d.ts" />

namespace Application {

  type Config = {
    readonly reportWebVitals: boolean;
    readonly tableDebug: boolean;
    readonly whyDidYouRender: boolean;
  };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
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
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type ModuleReducers = Redux.ReducersMapObject<ModuleStores>;

    type StaticStores = ModuleStores & {
      readonly router: import("connected-react-router").RouterState<import("history").LocationState>;
      readonly drawerVisible: boolean;
      readonly loading: boolean;
      readonly user: Model.User;
      readonly contacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    }
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type StaticReducers = Redux.ReducersMapObject<StaticStores>;

    type Store = StaticStores & Redux.AsyncStores<Redux.TableStore>;

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type Reducers = Redux.ReducersMapObject<Store>;

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type ModuleConfig<S extends AnyModuleStore = any> = Omit<
      Application.ModuleConfig<ModuleLabel, S>,
      "isUnauthenticated"
    > & {
      readonly isUnauthenticated?: false;
    };
  }

  namespace Unauthenticated {
    type ModuleLabel = "share";
    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type AnycModuleStore = Modules.Share.Store;
    type ModuleStores = {
      readonly share: Modules.Share.Store;
    }

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type ModuleReducers = Redux.ReducersMapObject<ModuleStores>;

    type StaticStores = ModuleStores & {
      readonly drawerVisible: boolean;
      readonly loading: boolean;
      readonly contacts: Redux.ListResponseStore<Model.Contact>;
    }

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type StaticReducers = Redux.ReducersMapObject<StaticStores>;

    type Store = StaticStores & Redux.AsyncStores<Redux.TableStore>;

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type Reducers = Redux.ReducersMapObject<Store>;

    /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
    type ModuleConfig<S extends Modules.Share.Store = any> = Omit<
      /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
      Application.ModuleConfig<ModuleLabel, S>,
      "isUnauthenticated"
    > & {
      readonly isUnauthenticated: true;
    };
  }

  type AnyModuleLabel = Authenticated.ModuleLabel | Unauthenticated.ModuleLabel;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  interface ModuleConfig<L extends AnyModuleLabel, S extends Redux.StoreObj> {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: L;
    readonly isUnauthenticated?: boolean;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type AnyModuleConfig = Authenticated.ModuleConfig | Unauthenticated.ModuleConfig;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModuleStores = Authenticated.ModuleStores | Unauthenticated.ModuleStores;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ModuleReducers = Authenticated.ModuleReducers | Unauthenticated.ModuleReducers;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type StaticReducers = Authenticated.StaticReducers | Unauthenticated.StaticReducers;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type StaticStores = Authenticated.StaticStores | Unauthenticated.StaticStores;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Store = Authenticated.Store | Unauthenticated.Store;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Reducers = Authenticated.Reducers | Unauthenticated.Reducers;
}
