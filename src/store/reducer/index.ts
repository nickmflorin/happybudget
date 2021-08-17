import { combineReducers } from "redux";
import { isNil, reduce, filter } from "lodash";
import { redux } from "lib";
import { GlobalActionTypes } from "../actions";
import { contactsReducer, subAccountUnitsReducer as unAuthenticatedSubAccountUnitsReducer } from "./unauthenticated";
import { createUserReducer, subAccountUnitsReducer as authenticatedSubAccountUnitsReducer } from "./authenticated";

const loadingReducer: Redux.Reducer<boolean> = (state: boolean = false, action: Redux.Action): boolean => {
  if (!isNil(action.payload) && action.type === GlobalActionTypes.SetApplicationLoading) {
    return action.payload;
  }
  return state;
};

function createModularApplicationReducer(
  config: Modules.Authenticated.ModuleConfig[]
): Modules.Authenticated.ModulesReducer;

function createModularApplicationReducer(
  config: Modules.Unauthenticated.ModuleConfig[]
): Modules.Unauthenticated.ModulesReducer;

function createModularApplicationReducer(config: Modules.ModuleConfig[]): Modules.ModulesReducer {
  return reduce(
    config,
    (prev: Modules.ModulesReducer, moduleConfig: Modules.ModuleConfig) => {
      return { ...prev, [moduleConfig.label]: moduleConfig.rootReducer };
    },
    {} as Modules.ModulesReducer
  );
}

/**
 * Creates the base application reducer for the authenticated user that bundles
 * up the reducers from the individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 * @param user   The User object returned from the JWT token validation.
 */
export const createAuthenticatedReducer = (
  config: Modules.ModuleConfigs,
  user: Model.User
): Redux.Reducer<Modules.Authenticated.Store> => {
  const moduleReducers = createModularApplicationReducer(
    filter(
      config,
      (c: Modules.ModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Modules.Authenticated.ModuleConfigs
  );
  return combineReducers({
    ...moduleReducers,
    user: createUserReducer(user),
    subAccountUnits: authenticatedSubAccountUnitsReducer,
    drawerVisible: redux.reducers.factories.createSimpleBooleanReducer(GlobalActionTypes.SetDrawerVisibility),
    loading: loadingReducer
  });
};

/**
 * Creates the base application reducer for the unauthenticated user that bundles
 * up the reducers from the individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 */
export const createUnauthenticatedReducer = (
  config: Modules.ModuleConfigs
): Redux.Reducer<Modules.Unauthenticated.Store> => {
  const moduleReducers = createModularApplicationReducer(
    filter(config, (c: Modules.ModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Modules.Unauthenticated.ModuleConfigs
  );
  return combineReducers({
    ...moduleReducers,
    contacts: contactsReducer,
    subAccountUnits: unAuthenticatedSubAccountUnitsReducer,
    drawerVisible: redux.reducers.factories.createSimpleBooleanReducer(GlobalActionTypes.SetDrawerVisibility),
    loading: loadingReducer
  });
};
