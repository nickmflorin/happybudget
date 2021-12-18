declare namespace Application {
  type Config = {
    readonly reportWebVitals: boolean;
    readonly tableDebug: boolean;
    readonly whyDidYouRender: boolean;
    readonly tableRowOrdering: boolean;
    readonly acceptedImageTypes: string[];
    readonly maxImageSize: number; // In MB
  };

  type ConfigOption = {
    readonly name: keyof Config;
    readonly default?: boolean;
    readonly hardOverride?: boolean;
    readonly env?: SingleOrArray<NodeJS.ProcessEnv["NODE_ENV"]>;
    readonly prodEnv?: SingleOrArray<NodeJS.ProcessEnv["PRODUCTION_ENV"]>;
  };

  type AuthenticatedModuleLabel = "dashboard" | "budget" | "template";
  type AuthenticatedAnyModuleStore = Modules.Budget.Store | Modules.Dashboard.Store | Modules.Template.Store;
  type AuthenticatedModuleStores = {
    readonly dashboard: Modules.Dashboard.Store;
    readonly budget: Modules.Budget.Store;
    readonly template: Modules.Template.Store;
  };
  type AuthenticatedModuleReducers = Redux.ReducersMapObject<AuthenticatedModuleStores>;

  type AuthenticatedStaticStores = AuthenticatedModuleStores & {
    readonly router: import("connected-react-router").RouterState<import("history").LocationState>;
    readonly drawerVisible: boolean;
    readonly loading: boolean;
    readonly user: Model.User;
    readonly contacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    readonly filteredContacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
  };

  type AuthenticatedStaticReducers = Redux.ReducersMapObject<StaticStores>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type AuthenticatedStore = AuthenticatedStaticStores & Redux.AsyncStores<Redux.TableStore<any>>;

  type AuthenticatedReducers = Redux.ReducersMapObject<AuthenticatedStore>;

  type AuthenticatedModuleConfig<S extends AuthenticatedAnyModuleStore = AuthenticatedAnyModuleStore> = Omit<
    ModuleConfig<AuthenticatedModuleLabel, S>,
    "isUnauthenticated"
  > & {
    readonly isUnauthenticated?: false;
  };

  type UnauthenticatedModuleLabel = "share";
  type UnauthenticatedAnycModuleStore = Modules.Share.Store;
  type UnauthenticatedModuleStores = {
    readonly share: Modules.Share.Store;
  };

  type UnauthenticatedModuleReducers = Redux.ReducersMapObject<UnauthenticatedModuleStores>;

  type UnauthenticatedStaticStores = UnauthenticatedModuleStores & {
    readonly drawerVisible: boolean;
    readonly loading: boolean;
    readonly contacts: Redux.ListResponseStore<Model.Contact>;
  };

  type UnauthenticatedStaticReducers = Redux.ReducersMapObject<UnauthenticatedStaticStores>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type UnauthenticatedStore = UnauthenticatedStaticStores & Redux.AsyncStores<Redux.TableStore<any>>;

  type UnauthenticatedReducers = Redux.ReducersMapObject<UnauthenticatedStore>;

  type UnauthenticatedModuleConfig<S extends Modules.Share.Store = Modules.Share.Store> = Omit<
    ModuleConfig<UnauthenticatedModuleLabel, S>,
    "isUnauthenticated"
  > & {
    readonly isUnauthenticated: true;
  };

  type AnyModuleLabel = AuthenticatedModuleLabel | UnauthenticatedModuleLabel;

  interface ModuleConfig<L extends AnyModuleLabel, S> {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: L;
    readonly isUnauthenticated?: boolean;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type AnyModuleConfig = AuthenticatedModuleConfig<any> | UnauthenticatedModuleConfig<any>;

  type ModuleStores = AuthenticatedModuleStores | UnauthenticatedModuleStores;

  type ModuleReducers = AuthenticatedModuleReducers | UnauthenticatedModuleReducers;

  type StaticReducers = AuthenticatedStaticReducers | UnauthenticatedStaticReducers;

  type StaticStores = AuthenticatedStaticStores | UnauthenticatedStaticStores;

  type Store = AuthenticatedStore | UnauthenticatedStore;

  type Reducers = AuthenticatedReducers | UnauthenticatedReducers;
}
