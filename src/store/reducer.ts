import { Reducer, combineReducers } from "redux";
import { forEach, isNil, includes } from "lodash";
import { redux } from "lib";
import { ApplicationActionTypes } from "./actions";
import { createInitialUserState } from "./initialState";

/**
 * Wraps each individual module level reducer so that if any action includes
 * the `label` attribute, and the module label in it's Redux configuration does
 * not match the label of the action, the action will not be allowed to propogate
 * through the reducer.
 *
 * This is useful if there are specific actions which we want to broadcast only
 * to the stores/reducers of a select module or subset of modules.
 *
 * @param config  The module level Redux configuration.
 */
const createWrappedModuleReducer = (
  config: Modules.ModuleConfig<any, any>
): Reducer<Modules.ModuleStore, Redux.Action<any>> => {
  const wrapped: Reducer<Modules.ModuleStore, Redux.Action<any>> = (
    state: Modules.ModuleStore = config.initialState,
    action: Redux.Action<any>
  ): any => {
    if (!isNil(action.label)) {
      if (Array.isArray(action.label)) {
        if (includes(action.label, config.label)) {
          return config.rootReducer(state, action);
        }
        return { ...state };
      } else {
        if (action.label === config.label) {
          return config.rootReducer(state, action);
        }
        return { ...state };
      }
    } else {
      return config.rootReducer(state, action);
    }
  };
  return wrapped;
};

/**
 * Creates the reducer to handle state changes to the User in the Redux store.
 * The initial state for the reducer is constructed with the provided Organization
 * ID and User Role.
 *
 * @param user   The User object returned from the JWT token validation.
 */
const createUserReducer = (user: Model.User): Reducer<Modules.UserStore, Redux.Action<any>> => {
  const initialUserState = createInitialUserState(user);

  const contactsReducer = redux.factories.createModelListResponseReducer<
    Model.Contact,
    Redux.ModelListResponseStore<Model.Contact>
  >({
    Response: ApplicationActionTypes.User.Contacts.Response,
    Request: ApplicationActionTypes.User.Contacts.Request,
    Loading: ApplicationActionTypes.User.Contacts.Loading,
    Select: ApplicationActionTypes.User.Contacts.Select,
    SetSearch: ApplicationActionTypes.User.Contacts.SetSearch,
    SetPage: ApplicationActionTypes.User.Contacts.SetPage,
    SetPageSize: ApplicationActionTypes.User.Contacts.SetPageSize,
    SetPageAndSize: ApplicationActionTypes.User.Contacts.SetPageAndSize,
    AddToState: ApplicationActionTypes.User.Contacts.AddToState,
    RemoveFromState: ApplicationActionTypes.User.Contacts.RemoveFromState,
    UpdateInState: ApplicationActionTypes.User.Contacts.UpdateInState,
    Creating: ApplicationActionTypes.User.Contacts.Creating,
    Updating: ApplicationActionTypes.User.Contacts.Updating,
    Deleting: ApplicationActionTypes.User.Contacts.Deleting
  });

  return (state: Modules.UserStore = initialUserState, action: Redux.Action<any>): Modules.UserStore => {
    let newState = { ...state };
    if (action.type === ApplicationActionTypes.User.UpdateInState) {
      newState = { ...newState, ...action.payload };
    }
    newState = { ...newState, contacts: contactsReducer(newState.contacts, action) };
    return newState;
  };
};

const loadingReducer: Reducer<boolean, Redux.Action<any>> = (
  state: boolean = false,
  action: Redux.Action<any>
): boolean => {
  if (!isNil(action.payload) && action.type === ApplicationActionTypes.SetApplicationLoading) {
    return action.payload;
  }
  return state;
};

/**
 * Creates the base application reducer that bundles up the reducers from the
 * individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 * @param user   The User object returned from the JWT token validation.
 */
const createApplicationReducer = (config: Modules.ApplicationConfig, user: Model.User): any => {
  let moduleReducers: { [key: string]: Reducer<Modules.ModuleStore, Redux.Action> } = {};
  forEach(config, (moduleConfig: Modules.ModuleConfig<any, any>) => {
    moduleReducers[moduleConfig.label] = createWrappedModuleReducer(moduleConfig);
  });
  return combineReducers({
    ...moduleReducers,
    user: createUserReducer(user),
    drawerVisible: redux.factories.createSimpleBooleanReducer(ApplicationActionTypes.SetDrawerVisibility),
    loading: loadingReducer
  });
};

export default createApplicationReducer;
