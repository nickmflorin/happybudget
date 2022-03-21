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

  type ModuleLabel = "dashboard" | "budget" | "template";

  type AnyModuleStore =
    | Modules.Budget.Store
    | Modules.Dashboard.Store
    | Modules.Template.Store
    | Modules.PublicBudget.Store;

  type PublicModuleStores = {
    readonly budget: Modules.PublicBudget.Store;
  };

  type AuthenticatedModuleStores = {
    readonly dashboard: Modules.Dashboard.Store;
    readonly budget: Modules.Budget.Store;
    readonly template: Modules.Template.Store;
  };

  type PublicModuleReducers = Redux.ReducersMapObject<PublicModuleStores>;
  type AuthenticatedModuleReducers = Redux.ReducersMapObject<AuthenticatedModuleStores>;

  type PublicStore = PublicModuleStores & {
    readonly tokenId: string | null;
  };

  type Store = AuthenticatedModuleStores & {
    readonly loading: boolean;
    readonly user: Model.User | null;
    readonly contacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    readonly filteredContacts: Redux.AuthenticatedModelListResponseStore<Model.Contact>;
    readonly productPermissionModalOpen: boolean;
    readonly public: PublicStore;
    readonly drawerOpen: boolean;
  };

  interface ModuleConfig<
    S extends
      | PublicModuleStores[keyof PublicModuleStores]
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      | AuthenticatedModuleStores[keyof AuthenticatedModuleStores] = any
  > {
    readonly rootSaga?: import("redux-saga").Saga;
    readonly rootReducer: Redux.Reducer<S>;
    readonly initialState: S | (() => S);
    readonly label: ModuleLabel;
    readonly isPublic?: boolean;
  }

  type StoreConfig = {
    readonly tokenId: string | null;
    readonly user: Model.User | null;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    readonly modules: ModuleConfig<any>[];
  };
}
