import { reduce, filter } from "lodash";
import { redux } from "lib";

export const createInitialUserState = (user: Model.User): Model.User => {
  return { ...user };
};

function createModularApplicationState(
  config: Application.AuthenticatedModuleConfig[]
): Application.AuthenticatedModuleStores;

function createModularApplicationState(config: Application.PublicModuleConfig[]): Application.PublicModuleStores;

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

export const createPublicInitialState = (config: Application.AnyModuleConfig[]): Application.PublicStore => {
  return {
    ...createModularApplicationState(
      filter(config, (c: Application.AnyModuleConfig) =>
        redux.typeguards.isPublicModuleConfig(c)
      ) as Application.PublicModuleConfig[]
    ),
    loading: false,
    contacts: redux.initialState.initialListResponseState
  } as Application.PublicStore;
};

export const createAuthenticatedInitialState = (
  config: Application.AnyModuleConfig[],
  user: Model.User
): Application.AuthenticatedStore => {
  return {
    ...createModularApplicationState(
      filter(
        config,
        (c: Application.AnyModuleConfig) => !redux.typeguards.isPublicModuleConfig(c)
      ) as Application.AuthenticatedModuleConfig[]
    ),
    user: createInitialUserState(user),
    loading: false,
    contacts: redux.initialState.initialModelListResponseState,
    productPermissionModalOpen: false
  } as Application.AuthenticatedStore;
};
