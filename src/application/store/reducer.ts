import { combineReducers, CombinedState } from "redux";

import { model } from "lib";

import * as config from "../config";

import * as actions from "./actions";
import * as initialState from "./initialState";
import * as reducers from "./reducers";
import * as types from "./types";

const createUserMetricsReducer =
  (user: model.User): types.BasicReducer<model.UserMetrics, actions.UserMetricsAction> =>
  (
    state: model.UserMetrics = user.metrics,
    action: actions.UserMetricsAction,
  ): model.UserMetrics => {
    const metric = action.payload.metric;
    if (actions.isUserMetricsValueAction(action)) {
      return { ...state, [metric]: action.payload.value };
    } else if (actions.isUserMetricsChangeAction(action)) {
      return action.payload.change === "decrement"
        ? { ...state, [metric]: Math.max(state[metric] - 1, 0) }
        : { ...state, [metric]: state[metric] + 1 };
    } else if (actions.isUserMetricsIncrementByAction(action)) {
      return { ...state, [metric]: state[metric] + action.payload.incrementBy };
    } else {
      return { ...state, [metric]: Math.max(state[metric] - action.payload.decrementBy, 0) };
    }
  };

const createUserReducer = (
  user: model.User | null,
): types.BasicReducer<model.User | null, actions.UserAction> => {
  /* We only need to be concerned with metrics when the store is configured with a user, and since
     the user cannot change from null => model.User without reconfiguring the store (see note below)
     we do not need to worry about updating the metrics reducer based on the presence of a user
     after the store is configured. */
  let userMetricsReducer: types.BasicReducer<model.UserMetrics, actions.UserMetricsAction> | null =
    null;
  if (user !== null) {
    userMetricsReducer = createUserMetricsReducer(user);
  }
  return (state: model.User | null = user, action: actions.UserAction): model.User | null => {
    /* The user is defined when the store is configured, and will never change from a null value to
       model.User (only from model.User => null in the case of a logout).  This is because when the
       user is logged in, and there is an active user present, the store's state is not updated with
       that user, but the store is recreated/reconfigured with that logged in user.

			 This means that if there is not currently a user in the store, we do not want to apply any
       state updates.
			 */
    if (state === null) {
      return null;
    } else if (actions.isUpdateUserAction(action)) {
      /* Do not permit the update to the user in the store if it pertains to a different user than
         the store was configured for as this would indicate that something is critically wrong with
         our application logic since a different user should trigger the reconfiguration of the
         entire store. */
      if (state.id !== action.payload.id) {
        throw new Error(
          "Attempting to update the store with different user than the store was configured for.",
        );
      }
      return { ...state, ...action.payload };
    } else if (actions.isUserMetricsAction(action)) {
      /* This should not happen, as it would mean that the user changed from
         null to a non-null value without having reconfigured the store. */
      if (userMetricsReducer === null) {
        throw new Error(
          "Attempting to update user metrics when the store was not configured with a user.",
        );
      }
      return { ...state, metrics: userMetricsReducer(state.metrics, action) };
    } else if (actions.isUserClearAction(action)) {
      return null;
    }
    return state;
  };
};

const createPublicApplicationReducer = (
  storeConfig: types.StoreConfig,
): types.Reducer<CombinedState<types.PublicStore>> =>
  combineReducers({
    ...config.PUBLIC_MODULE_REDUCERS,
    /* The store is configured with the tokenId, so the tokenId in the store should never and change
       and should be prevented from changing.  Thus the reducer is just the identity. */
    tokenId: () => storeConfig.tokenId,
  });

export const createApplicationReducer = (
  storeConfig: types.StoreConfig,
): types.Reducer<CombinedState<types.ApplicationStore>> =>
  combineReducers<types.ApplicationStore>({
    ...config.AUTH_MODULE_REDUCERS,
    public: createPublicApplicationReducer(storeConfig),
    contacts: reducers.createAuthenticatedModelListReducer<model.Contact>({
      initialState: initialState.initialAuthenticatedApiModelListResponseState<model.Contact>(),
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction,
        updateInState: actions.updateContactInStateAction,
        removeFromState: actions.removeContactFromStateAction,
        addToState: actions.addContactToStateAction,
      },
    }),
    filteredContacts: reducers.createAuthenticatedModelListReducer<model.Contact>({
      initialState: initialState.initialAuthenticatedApiModelListResponseState<model.Contact>(),
      actions: {
        request: actions.requestFilteredContactsAction,
        response: actions.responseFilteredContactsAction,
        loading: actions.loadingFilteredContactsAction,
        updateInState: actions.updateContactInStateAction,
        removeFromState: actions.removeContactFromStateAction,
        addToState: actions.addContactToStateAction,
        setSearch: actions.setContactsSearchAction,
      },
    }),
    subaccountUnits: reducers.createModelListReducer<model.SubAccountUnit>({
      actions: { response: actions.responseSubAccountUnitsAction },
      initialState: initialState.initialListResponseState<model.SubAccountUnit>(),
    }),
    fringeColors: reducers.createListReducer<string>({
      actions: { response: actions.responseFringeColorsAction },
      initialState: initialState.initialListResponseState<string>(),
    }),
    actualTypes: reducers.createModelListReducer<model.ActualType>({
      actions: { response: actions.responseActualTypesAction },
      initialState: initialState.initialListResponseState<model.ActualType>(),
    }),
    loading: reducers.createSimpleBooleanReducer({
      actions: { set: actions.setApplicationLoadingAction },
    }),
    user: reducers.withActionsOnly<model.User | null, actions.UserAction>(
      createUserReducer(storeConfig.user),
      storeConfig.user,
      [
        actions.updateLoggedInUserAction.toString(),
        actions.updateLoggedInUserMetricsAction.toString(),
        actions.clearLoggedInUserAction.toString(),
      ],
    ),
    productPermissionModalOpen: reducers.createSimpleBooleanReducer({
      actions: { set: actions.setProductPermissionModalOpenAction },
    }),
    drawerOpen: reducers.createSimpleBooleanToggleReducer({
      actions: { set: actions.setApplicationDrawerAction },
    }),
  });
