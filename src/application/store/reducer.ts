import { reduce, filter } from "lodash";
import { combineReducers, CombinedState } from "redux";

import { redux } from "lib";

import * as actions from "./actions";

type UpdateUserAction = Redux.Action<Model.User>;
type ClearUserAction = Redux.Action<null>;
type UserAction = UpdateUserAction | Redux.UserMetricsAction | ClearUserAction;

const isUserMetricsValueAction = (
  a: Redux.UserMetricsAction,
): a is Redux.Action<Redux.UserMetricsValuePayload> =>
  (a as Redux.Action<Redux.UserMetricsValuePayload>).payload.value !== undefined;

const isUserMetricsChangeAction = (
  a: Redux.UserMetricsAction,
): a is Redux.Action<Redux.UserMetricsChangePayload> =>
  (a as Redux.Action<Redux.UserMetricsChangePayload>).payload.change !== undefined;

const isUserMetricsIncrementByAction = (
  a: Redux.UserMetricsAction,
): a is Redux.Action<Redux.UserMetricsIncrementByPayload> =>
  (a as Redux.Action<Redux.UserMetricsIncrementByPayload>).payload.incrementBy !== undefined;

const createUserMetricsReducer =
  (user: Model.User): Redux.BasicReducer<Model.UserMetrics, Redux.UserMetricsAction> =>
  (state: Model.UserMetrics = user.metrics, action: Redux.UserMetricsAction): Model.UserMetrics => {
    const metric = action.payload.metric;
    if (isUserMetricsValueAction(action)) {
      return { ...state, [metric]: action.payload.value };
    } else if (isUserMetricsChangeAction(action)) {
      return action.payload.change === "decrement"
        ? { ...state, [metric]: Math.max(state[metric] - 1, 0) }
        : { ...state, [metric]: state[metric] + 1 };
    } else if (isUserMetricsIncrementByAction(action)) {
      return { ...state, [metric]: state[metric] + action.payload.incrementBy };
    } else {
      return { ...state, [metric]: Math.max(state[metric] - action.payload.decrementBy, 0) };
    }
  };

const isUpdateUserAction = (a: UserAction): a is UpdateUserAction =>
  a.type === actions.updateLoggedInUserAction.toString();

const isUserMetricsAction = (a: UserAction): a is Redux.UserMetricsAction =>
  a.type === actions.updateLoggedInUserMetricsAction.toString();

const isUserClearAction = (a: UserAction): a is Redux.UserMetricsAction =>
  a.type === actions.clearLoggedInUserAction.toString();

const createUserReducer = (
  user: Model.User | null,
): Redux.BasicReducer<Model.User | null, UserAction> => {
  /* We only need to be concerned with metrics when the store is configured
	   with a user, and since the user cannot change from null => Model.User
		 without reconfiguring the store (see note below) we do not need to worry
		 about updating the metrics reducer based on the presence of a user after
		 the store is configured. */
  let userMetricsReducer: Redux.BasicReducer<Model.UserMetrics, Redux.UserMetricsAction> | null =
    null;
  if (user !== null) {
    userMetricsReducer = createUserMetricsReducer(user);
  }
  return (state: Model.User | null = user, action: UserAction): Model.User | null => {
    /* The user is defined when the store is configured, and will never change
		   from a null value to Model.User (only from Model.User => null in the case
			 of a logout).  This is because when the user is logged in, and there is
			 an active user present, the store's state is not updated with that user,
			 but the store is recreated/reconfigured with that logged in user.

			 This means that if there is not currently a user in the store, we do not
			 want to apply any state updates.
			 */
    if (state === null) {
      return null;
    } else if (isUpdateUserAction(action)) {
      /* Do not permit the update to the user in the store if it pertains to
         a different user than the store was configured for as this would
         indicate that something is critically wrong with our application logic
         since a different user should trigger the reconfiguration of the entire
         store. */
      if (state.id !== action.payload.id) {
        throw new Error(
          "Attempting to update the store with different user than the store was configured for.",
        );
      }
      return { ...state, ...action.payload };
    } else if (isUserMetricsAction(action)) {
      /* This should not happen, as it would mean that the user changed from
         null to a non-null value without having reconfigured the store. */
      if (userMetricsReducer === null) {
        throw new Error(
          "Attempting to update user metrics when the store was not configured with a user.",
        );
      }
      return { ...state, metrics: userMetricsReducer(state.metrics, action) };
    } else if (isUserClearAction(action)) {
      return null;
    }
    return state;
  };
};

const createModularApplicationReducer = <
  S extends Application.AuthenticatedModuleReducers | Application.PublicModuleReducers,
>(
  config: Application.ModuleConfig[],
): S =>
  reduce(
    config,
    (prev: S, moduleConfig: Application.ModuleConfig) => ({
      ...prev,
      [moduleConfig.label]: moduleConfig.rootReducer,
    }),
    {} as S,
  );

const createPublicApplicationReducer = (
  config: Application.StoreConfig,
): Redux.Reducer<CombinedState<Application.PublicStore>> =>
  combineReducers({
    ...createModularApplicationReducer(
      filter(config.modules, (c: Application.ModuleConfig) => c.isPublic === true),
    ),
    /* The store is configured with the tokenId, so the tokenId in the store
       should never and change and should be prevented from changing.  Thus the
       reducer is just the identity. */
    tokenId: () => config.tokenId,
  });

const createApplicationReducer = (
  config: Application.StoreConfig,
): Redux.Reducer<CombinedState<Application.Store>, Redux.ActionContext> =>
  combineReducers({
    ...createModularApplicationReducer(
      filter(config.modules, (c: Application.ModuleConfig) => c.isPublic !== true),
    ),
    public: createPublicApplicationReducer(config),
    contacts: redux.reducers.createAuthenticatedModelListReducer<Model.Contact>({
      initialState: redux.initialAuthenticatedModelListResponseState,
      actions: {
        request: actions.requestContactsAction,
        response: actions.responseContactsAction,
        loading: actions.loadingContactsAction,
        updateInState: actions.updateContactInStateAction,
        removeFromState: actions.removeContactFromStateAction,
        addToState: actions.addContactToStateAction,
      },
    }),
    filteredContacts: redux.reducers.createAuthenticatedModelListReducer<Model.Contact>({
      initialState: redux.initialAuthenticatedModelListResponseState,
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
    subaccountUnits: redux.reducers.createModelListReducer({
      actions: { response: actions.responseSubAccountUnitsAction },
      initialState: redux.initialListResponseState,
    }),
    fringeColors: redux.reducers.createListReducer<string>({
      actions: { response: actions.responseFringeColorsAction },
      initialState: redux.initialListResponseState,
    }),
    actualTypes: redux.reducers.createModelListReducer({
      actions: { response: actions.responseActualTypesAction },
      initialState: redux.initialListResponseState,
    }),
    loading: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setApplicationLoadingAction },
    }),
    user: redux.reducers.withActionsOnly<Model.User | null, Redux.ActionContext, UserAction>(
      createUserReducer(config.user),
      config.user,
      [
        actions.updateLoggedInUserAction,
        actions.updateLoggedInUserMetricsAction,
        actions.clearLoggedInUserAction,
      ],
    ),
    productPermissionModalOpen: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setProductPermissionModalOpenAction },
    }),
    drawerOpen: redux.reducers.createSimpleBooleanToggleReducer({
      actions: { set: actions.setApplicationDrawerAction },
    }),
  });

export default createApplicationReducer;
