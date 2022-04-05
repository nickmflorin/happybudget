import { combineReducers, CombinedState } from "redux";

import { reduce, filter } from "lodash";
import { redux } from "lib";

import * as actions from "./actions";

type UpdateUserAction = Redux.Action<Model.User>;
type ClearUserAction = Redux.Action<null>;
type UserAction = UpdateUserAction | Redux.UserMetricsAction | ClearUserAction;

const isUserMetricsValueAction = (a: Redux.UserMetricsAction): a is Redux.Action<Redux.UserMetricsValuePayload> =>
  (a as Redux.Action<Redux.UserMetricsValuePayload>).payload.value !== undefined;

const isUserMetricsChangeAction = (a: Redux.UserMetricsAction): a is Redux.Action<Redux.UserMetricsChangePayload> =>
  (a as Redux.Action<Redux.UserMetricsChangePayload>).payload.change !== undefined;

const isUserMetricsIncrementByAction = (
  a: Redux.UserMetricsAction
): a is Redux.Action<Redux.UserMetricsIncrementByPayload> =>
  (a as Redux.Action<Redux.UserMetricsIncrementByPayload>).payload.incrementBy !== undefined;

const createUserMetricsReducer =
  (user: Model.User): Redux.Reducer<Model.UserMetrics, Redux.UserMetricsAction> =>
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

const createUserReducer = (user: Model.User | null): Redux.Reducer<Model.User | null, UserAction> => {
  let userMetricsReducer: Redux.Reducer<Model.UserMetrics, Redux.UserMetricsAction> | null = null;
  if (user !== null) {
    userMetricsReducer = createUserMetricsReducer(user);
  }
  return (state: Model.User | null = user, action: UserAction): Model.User | null => {
    /* We only allow the user or the user metrics to be updated in the store if
		   the store was initially configured with that user.  If the store was not
			 configured with a user, we simply do not perform the update.  If the store
			 was configured with a different user, than we need to raise an error - as
			 this is a sign that there is a flaw in our application logic. */
    if (isUserMetricsAction(action) || isUpdateUserAction(action)) {
      /* Do not permit the update if the store was not configured with a user or
         the user was cleared from the store. */
      if (state !== null) {
        if (isUpdateUserAction(action) && state.id !== action.payload.id) {
          throw new Error("Attempting to update the store with different user than the store was configured for.");
        } else if (isUpdateUserAction(action)) {
          return { ...state, ...action.payload };
        } else if (userMetricsReducer !== null) {
          return { ...state, metrics: userMetricsReducer(state.metrics, action) };
        }
      }
    } else if (isUserClearAction(action)) {
      return null;
    }
    return state;
  };
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
    loading: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setApplicationLoadingAction }
    }),
    user: redux.reducers.withActionsOnly<Model.User | null, UserAction>(createUserReducer(config.user), config.user, [
      actions.updateLoggedInUserAction,
      actions.updateLoggedInUserMetricsAction,
      actions.clearLoggedInUserAction
    ]),
    productPermissionModalOpen: redux.reducers.createSimpleBooleanReducer({
      actions: { set: actions.setProductPermissionModalOpenAction }
    }),
    drawerOpen: redux.reducers.createSimpleBooleanToggleReducer({
      actions: { set: actions.setApplicationDrawerAction }
    })
  });

export default createApplicationReducer;
