import { reduce, filter } from "lodash";
import { redux } from "lib";

export const createInitialUserState = (user: Model.User): Model.User => {
  return { ...user };
};

function createModularApplicationState(
  config: Application.AuthenticatedModuleConfig[]
): Application.AuthenticatedModuleStores;

function createModularApplicationState(
  config: Application.UnauthenticatedModuleConfig[]
): Application.UnauthenticatedModuleStores;

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
): Application.UnauthenticatedStore => {
  return {
    ...createModularApplicationState(
      filter(config, (c: Application.AnyModuleConfig) =>
        redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Application.UnauthenticatedModuleConfig[]
    ),
    drawerVisible: false,
    loading: false,
    contacts: redux.initialState.initialListResponseState
  } as Application.UnauthenticatedStore;
};

export const createAuthenticatedInitialState = (
  config: Application.AnyModuleConfig[],
  user: Model.User
): Application.AuthenticatedStore => {
  return {
    ...createModularApplicationState(
      filter(
        config,
        (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
      ) as Application.AuthenticatedModuleConfig[]
    ),
    user: createInitialUserState(user),
    drawerVisible: false,
    loading: false,
    contacts: redux.initialState.initialModelListResponseState
  } as Application.AuthenticatedStore;
};
