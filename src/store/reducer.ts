import { History } from "history";
import { connectRouter } from "connected-react-router";

import { isNil, reduce, filter } from "lodash";
import { redux } from "lib";

import * as actions from "./actions";
import { createInitialUserState } from "./initialState";

const createUserReducer = (user: Model.User): Redux.Reducer<Model.User> => {
  const initialUserState = createInitialUserState(user);

  return (state: Model.User = initialUserState, action: Redux.Action): Model.User => {
    let newState = { ...state };
    if (action.type === actions.authenticated.updateLoggedInUserAction.toString()) {
      newState = { ...newState, ...action.payload };
    }
    return newState;
  };
};

const loadingReducer: Redux.Reducer<boolean> = (state: boolean = false, action: Redux.Action): boolean => {
  if (!isNil(action.payload) && action.type === actions.setApplicationLoadingAction.toString()) {
    return action.payload;
  }
  return state;
};

function createModularApplicationReducer(
  config: Application.Authenticated.ModuleConfig[]
): Application.Authenticated.ModuleReducers;

function createModularApplicationReducer(
  config: Application.Unauthenticated.ModuleConfig[]
): Application.Unauthenticated.ModuleReducers;

function createModularApplicationReducer(config: Application.AnyModuleConfig[]): Application.ModuleReducers {
  return reduce(
    config,
    (prev: Application.ModuleReducers, moduleConfig: Application.AnyModuleConfig) => {
      return { ...prev, [moduleConfig.label]: moduleConfig.rootReducer };
    },
    {} as Application.ModuleReducers
  );
}

/**
 * Creates the base application reducer for the authenticated user that bundles
 * up the reducers from the individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 * @param user   The User object returned from the JWT token validation.
 */
export const createStaticAuthenticatedReducers = (
  config: Application.AnyModuleConfig[],
  user: Model.User,
  history: History<any>
): Application.Authenticated.StaticReducers => {
  const moduleReducers = createModularApplicationReducer(
    filter(
      config,
      (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.Authenticated.ModuleConfig[]
  );
  return {
    ...moduleReducers,
    router: connectRouter(history),
    contacts: redux.reducers.createModelListResponseReducer<
      Model.Contact,
      Omit<Redux.ModelListResponseActionMap<Model.Contact>, "restoreSearchCache" | "setSearch">
    >({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction,
        updateInState: actions.authenticated.updateContactInStateAction,
        removeFromState: actions.authenticated.removeContactFromStateAction,
        addToState: actions.authenticated.addContactToStateAction,
        creating: actions.authenticated.creatingContactAction,
        updating: actions.authenticated.updatingContactAction,
        deleting: actions.authenticated.deletingContactAction
      }
    }),
    drawerVisible: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setDrawerVisibilityAction }
    }),
    loading: loadingReducer,
    user: createUserReducer(user)
  };
};

/**
 * Creates the base application reducer for the Unauthenticated user that bundles
 * up the reducers from the individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 */
export const createStaticUnauthenticatedReducers = (
  config: Application.AnyModuleConfig[],
  history: History<any>
): Application.Unauthenticated.StaticReducers => {
  const moduleReducers = createModularApplicationReducer(
    filter(config, (c: Application.AnyModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.Unauthenticated.ModuleConfig[]
  );
  return {
    ...moduleReducers,
    contacts: redux.reducers.createListResponseReducer<Model.Contact>({
      initialState: redux.initialState.initialModelListResponseState,
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction
      }
    }),
    drawerVisible: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setDrawerVisibilityAction }
    }),
    loading: loadingReducer
  };
};
