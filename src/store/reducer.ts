import { combineReducers, CombinedState } from "redux";

import { isNil, reduce, filter } from "lodash";
import { redux } from "lib";

import * as actions from "./actions";

const createUserReducer =
  (user: Model.User | null): Redux.Reducer<Model.User | null, Redux.Action<Model.User>> =>
  (state: Model.User | null = user, action: Redux.Action<Model.User>): Model.User | null => {
    /* We only allow the user to be updated in the store if the store was
       initially configured with that user.  If the store was not configured with
       that user or the store was configured with no user at all, we do not
       permit the update. */
    if (action.type === actions.updateLoggedInUserAction.toString()) {
      if (state !== null) {
        if (state.id !== action.payload.id) {
          throw new Error("Attempting to update the store with different user than the store was configured for.");
        }
        return { ...state, ...action.payload };
      }
    } else if (action.type === actions.clearLoggedInUserAction.toString()) {
      return null;
    }
    return state;
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

const createModularApplicationReducer = <
  S extends Application.AuthenticatedModuleReducers | Application.PublicModuleReducers
>(
  config: Application.ModuleConfig[]
): S =>
  reduce(
    config,
    (prev: S, moduleConfig: Application.ModuleConfig) => {
      return { ...prev, [moduleConfig.label]: moduleConfig.rootReducer };
    },
    {} as S
  );

const createPublicApplicationReducer = (
  config: Application.StoreConfig
): Redux.Reducer<CombinedState<Application.PublicStore>> =>
  combineReducers({
    ...createModularApplicationReducer(filter(config.modules, (c: Application.ModuleConfig) => c.isPublic === true)),
    /* The store is configured with the tokenId, so the tokenId in the store
       should never and change and should be prevented from changing.  Thus the
       reducer is just the identity. */
    tokenId: () => config.tokenId
  });

const createApplicationReducer = (config: Application.StoreConfig): Redux.Reducer<CombinedState<Application.Store>> =>
  combineReducers({
    ...createModularApplicationReducer(filter(config.modules, (c: Application.ModuleConfig) => c.isPublic !== true)),
    public: createPublicApplicationReducer(config),
    contacts: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.Contact,
      null,
      Tables.ContactTableContext,
      Redux.AuthenticatedModelListResponseStore<Model.Contact>
    >({
      initialState: redux.initialAuthenticatedModelListResponseState,
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction,
        updateInState: actions.updateContactInStateAction,
        removeFromState: actions.removeContactFromStateAction,
        addToState: actions.addContactToStateAction
      }
    }),
    filteredContacts: redux.reducers.createAuthenticatedModelListResponseReducer<
      Model.Contact,
      null,
      Tables.ContactTableContext,
      Redux.AuthenticatedModelListResponseStore<Model.Contact>
    >({
      initialState: redux.initialAuthenticatedModelListResponseState,
      actions: {
        request: actions.requestFilteredContactsAction,
        response: actions.responseFilteredContactsAction,
        loading: actions.loadingFilteredContactsAction,
        updateInState: actions.updateContactInStateAction,
        removeFromState: actions.removeContactFromStateAction,
        addToState: actions.addContactToStateAction,
        setSearch: actions.setContactsSearchAction
      }
    }),
    loading: loadingReducer,
    user: createUserReducer(config.user),
    productPermissionModalOpen: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setProductPermissionModalOpenAction }
    })
  });

export default createApplicationReducer;
