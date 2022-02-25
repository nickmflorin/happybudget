import { reduce, filter } from "lodash";

import { redux } from "lib";

const createModularApplicationState = <
  S extends Application.AuthenticatedModuleStores | Application.PublicModuleStores
>(
  config: Application.ModuleConfig[]
): S =>
  reduce(
    config,
    (prev: S, moduleConfig: Application.ModuleConfig) => {
      if (typeof moduleConfig.initialState === "function") {
        return { ...prev, [moduleConfig.label]: moduleConfig.initialState() };
      }
      return { ...prev, [moduleConfig.label]: moduleConfig.initialState };
    },
    {} as S
  );

const createPublicInitialState = (config: Application.StoreConfig): Application.PublicStore => {
  return {
    ...createModularApplicationState(filter(config.modules, (c: Application.ModuleConfig) => c.isPublic === true)),
    tokenId: config.tokenId
  };
};

const createApplicationInitialState = (config: Application.StoreConfig): Application.Store => ({
  ...createModularApplicationState(filter(config.modules, (c: Application.ModuleConfig) => c.isPublic !== true)),
  user: config.user,
  loading: false,
  contacts: redux.initialState.initialAuthenticatedModelListResponseState,
  filteredContacts: redux.initialState.initialAuthenticatedModelListResponseState,
  productPermissionModalOpen: false,
  public: createPublicInitialState(config)
});

export default createApplicationInitialState;
