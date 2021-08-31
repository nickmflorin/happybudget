import { reduce, filter } from "lodash";
import { redux } from "lib";

export const createInitialUserState = (user: Model.User): Model.User => {
  return { ...user };
};

function createModularApplicationState(
  config: Application.Authenticated.ModuleConfig[]
): Application.Authenticated.ModuleStores;

function createModularApplicationState(
  config: Application.Unauthenticated.ModuleConfig[]
): Application.Unauthenticated.ModuleStores;

function createModularApplicationState(config: Application.AnyModuleConfig[]): Application.ModuleStores {
  return reduce(
    config,
    (prev: Application.ModuleStores, moduleConfig: Application.AnyModuleConfig) => {
      if (typeof moduleConfig.initialState === "function") {
        return { ...prev, [moduleConfig.label]: moduleConfig.initialState() };
      }
      return { ...prev, [moduleConfig.label]: moduleConfig.initialState };
    },
    {} as Application.ModuleStores
  );
}

export const createUnauthenticatedInitialState = (
  config: Application.AnyModuleConfig[]
): Application.Unauthenticated.Store => {
  return {
    ...createModularApplicationState(
      filter(config, (c: Application.AnyModuleConfig) =>
        redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Application.Unauthenticated.ModuleConfig[]
    ),
    drawerVisible: false,
    loading: false,
    contacts: redux.initialState.initialListResponseState
  } as Application.Unauthenticated.Store;
};

export const createAuthenticatedInitialState = (
  config: Application.AnyModuleConfig[],
  user: Model.User
): Application.Authenticated.Store => {
  return {
    ...createModularApplicationState(
      filter(
        config,
        (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Application.Authenticated.ModuleConfig[]
    ),
    user: createInitialUserState(user),
    drawerVisible: false,
    loading: false,
    contacts: redux.initialState.initialModelListResponseState
  } as Application.Authenticated.Store;
};
