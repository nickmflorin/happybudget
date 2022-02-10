declare namespace Application {
  type Config = {
    readonly reportWebVitals: boolean;
    readonly tableDebug: boolean;
    readonly whyDidYouRender: boolean;
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

  type AuthenticatedStore = AuthenticatedModuleStores & {
    readonly router: import("connected-react-router").RouterState<import("history").LocationState>;
    readonly loading: boolean;
    readonly user: Model.User;
    readonly contacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    readonly filteredContacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    readonly productPermissionModalOpen: boolean;
  };

  type AuthenticatedReducers = Redux.ReducersMapObject<AuthenticatedStore>;

  type AuthenticatedModuleConfig<S extends AuthenticatedAnyModuleStore = AuthenticatedAnyModuleStore> = Omit<
    ModuleConfig<AuthenticatedModuleLabel, S>,
    "isPublic"
  > & {
    readonly isPublic?: false;
  };

  type PublicModuleLabel = "share";
  type PublicAnycModuleStore = Modules.Share.Store;
  type PublicModuleStores = {
    readonly share: Modules.Share.Store;
  };

  type PublicModuleReducers = Redux.ReducersMapObject<PublicModuleStores>;

  type PublicStore = PublicModuleStores & {
    readonly loading: boolean;
    readonly contacts: Redux.ListResponseStore<Model.Contact>;
  };

  type PublicReducers = Redux.ReducersMapObject<PublicStore>;

  type PublicModuleConfig<S extends Modules.Share.Store = Modules.Share.Store> = Omit<
    ModuleConfig<PublicModuleLabel, S>,
    "isPublic"
  > & {
    readonly isPublic: true;
  };

  type AnyModuleLabel = AuthenticatedModuleLabel | PublicModuleLabel;

  interface ModuleConfig<L extends AnyModuleLabel, S> {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: L;
    readonly isPublic?: boolean;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type AnyModuleConfig = AuthenticatedModuleConfig<any> | PublicModuleConfig<any>;

  type ModuleStores = AuthenticatedModuleStores | PublicModuleStores;

  type ModuleReducers = AuthenticatedModuleReducers | PublicModuleReducers;

  type Store = AuthenticatedStore | PublicStore;

  type Reducers = AuthenticatedReducers | PublicReducers;
}
