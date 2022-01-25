import { History } from "history";
import { connectRouter } from "connected-react-router";

import { isNil, reduce, filter } from "lodash";
import { redux } from "lib";

import * as actions from "./actions";
import { createInitialUserState } from "./initialState";

const createUserReducer = (user: Model.User): Redux.Reducer<Model.User, Redux.Action<Model.User>> => {
  const initialUserState = createInitialUserState(user);

  return (state: Model.User = initialUserState, action: Redux.Action<Model.User>): Model.User => {
    let newState = { ...state };
    if (action.type === actions.authenticated.updateLoggedInUserAction.toString()) {
      newState = { ...newState, ...action.payload };
    }
    return newState;
  };
};

const loadingReducer: Redux.Reducer<boolean, Redux.Action<boolean>> = (
  state = false,
  action: Redux.Action<boolean>
): boolean => {
  if (!isNil(action.payload) && action.type === actions.setApplicationLoadingAction.toString()) {
    return action.payload;
  }
  return state;
};

function createModularApplicationReducer(
  config: Application.AuthenticatedModuleConfig[]
): Application.AuthenticatedModuleReducers;

function createModularApplicationReducer(
  config: Application.UnauthenticatedModuleConfig[]
): Application.UnauthenticatedModuleReducers;

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
  history: History
): Application.AuthenticatedStaticReducers => {
  const moduleReducers = createModularApplicationReducer(
    filter(
      config,
      (c: Application.AnyModuleConfig) => !redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.AuthenticatedModuleConfig[]
  );
  return {
    ...moduleReducers,
    router: connectRouter(history),
    contacts: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.Contact,
      null,
      Tables.ContactTableContext,
      Redux.AuthenticatedModelListResponseStore<Model.Contact>
    >({
      initialState: redux.initialState.initialAuthenticatedModelListResponseState,
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction,
        updateInState: actions.authenticated.updateContactInStateAction,
        removeFromState: actions.authenticated.removeContactFromStateAction,
        addToState: actions.authenticated.addContactToStateAction
      }
    }),
    filteredContacts: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.Contact,
      null,
      Tables.ContactTableContext,
      Redux.AuthenticatedModelListResponseStore<Model.Contact>
    >({
      initialState: redux.initialState.initialAuthenticatedModelListResponseState,
      actions: {
        request: actions.authenticated.requestFilteredContactsAction,
        response: actions.authenticated.responseFilteredContactsAction,
        loading: actions.authenticated.loadingFilteredContactsAction,
        updateInState: actions.authenticated.updateContactInStateAction,
        removeFromState: actions.authenticated.removeContactFromStateAction,
        addToState: actions.authenticated.addContactToStateAction,
        setSearch: actions.authenticated.setContactsSearchAction
      }
    }),
    loading: loadingReducer,
    user: createUserReducer(user),
    productPermissionModalOpen: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.authenticated.setProductPermissionModalOpenAction }
    })
  };
};

/**
 * Creates the base application reducer for the Unauthenticated user that bundles
 * up the reducers from the individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 */
export const createStaticUnauthenticatedReducers = (
  config: Application.AnyModuleConfig[]
): Application.UnauthenticatedStaticReducers => {
  const moduleReducers = createModularApplicationReducer(
    filter(config, (c: Application.AnyModuleConfig) =>
      redux.typeguards.isUnauthenticatedModuleConfig(c)
    ) as Application.UnauthenticatedModuleConfig[]
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
    loading: loadingReducer
  };
};
