import { reduce, filter } from "lodash";
import { redux } from "lib";

export const createInitialUserState = (user: Model.User): Modules.Authenticated.UserStore => {
  return {
    ...user,
    contacts: redux.initialState.initialTableState
  };
};

function createModularApplicationState(
  config: Modules.Authenticated.ModuleConfig[]
): Modules.Authenticated.ModulesStore;

function createModularApplicationState(
  config: Modules.Unauthenticated.ModuleConfig[]
): Modules.Unauthenticated.ModulesStore;

function createModularApplicationState(config: Modules.ModuleConfig[]): Modules.ModulesStore {
  return reduce(
    config,
    (prev: Modules.ModulesStore, moduleConfig: Modules.ModuleConfig) => {
      if (typeof moduleConfig.initialState === "function") {
        return { ...prev, [moduleConfig.label]: moduleConfig.initialState() };
      }
      return { ...prev, [moduleConfig.label]: moduleConfig.initialState };
    },
    {} as Modules.ModulesStore
  );
}

export const createUnauthenticatedInitialState = (config: Modules.ModuleConfigs): Modules.Unauthenticated.Store => {
  return {
    ...createModularApplicationState(
      filter(config, (c: Modules.ModuleConfig) =>
        redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Modules.Unauthenticated.ModuleConfigs
    ),
    drawerVisible: false,
    loading: false
  } as Modules.Unauthenticated.Store;
};

export const createAuthenticatedInitialState = (
  config: Modules.ModuleConfigs,
  user: Model.User
): Modules.Authenticated.Store => {
  return {
    ...createModularApplicationState(
      filter(
        config,
        (c: Modules.ModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Modules.Authenticated.ModuleConfigs
    ),
    user: createInitialUserState(user),
    drawerVisible: false,
    loading: false
  } as Modules.Authenticated.Store;
};
