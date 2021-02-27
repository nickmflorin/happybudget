import { Reducer, combineReducers } from "redux";
import { forEach, isNil, includes, find } from "lodash";
import { replaceInArray } from "util/arrays";
import { ApplicationActionTypes } from "./actions";
import { createInitialUserState, createInitialOrganizationState } from "./initialState";
import { createListResponseReducer } from "./util";

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
  config: Redux.IModuleConfig<any, any>
): Reducer<Redux.IModuleStore, Redux.IAction<any>> => {
  const wrapped: Reducer<Redux.IModuleStore, Redux.IAction<any>> = (
    state: Redux.IModuleStore = config.initialState,
    action: Redux.IAction<any>
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
 * Creates the reducer to handle state changes to the Organization that the
 * User in the Redux store belongs to. The initial state for the reducer is
 * constructed with the provided Organization ID.
 *
 * @param orgId   The Organization ID of the currently logged in User.
 */
const createUserOrganizationReducer = (orgId: number): Reducer<Redux.IOrganizationStore, Redux.IAction<any>> => {
  const initialOrganizationState = createInitialOrganizationState(orgId);
  const organizationReducer: Reducer<Redux.IOrganizationStore, Redux.IAction<any>> = (
    state: Redux.IOrganizationStore = initialOrganizationState,
    action: Redux.IAction<any>
  ): Redux.IOrganizationStore => {
    let newState = { ...state };
    if (action.type === ApplicationActionTypes.User.Organization.Users.Response) {
      newState.users = { ...newState.users, data: action.payload.data, count: action.payload.count };
    }
    return newState;
  };
  return organizationReducer;
};

/**
 * Creates the reducer to handle state changes to the User in the Redux store.
 * The initial state for the reducer is constructed with the provided Organization
 * ID and User Role.
 *
 * @param user   The User object returned from the JWT token validation.
 */
const createUserReducer = (user: IUser): Reducer<Redux.IUserStore, Redux.IAction<any>> => {
  const initialUserState = createInitialUserState(user);
  const userReducer: Reducer<Redux.IUserStore, Redux.IAction<any>> = (
    state: Redux.IUserStore = initialUserState,
    action: Redux.IAction<any>
  ): Redux.IUserStore => {
    let newState = { ...state };
    if (action.type === ApplicationActionTypes.User.UpdateInState) {
      newState = { ...newState, ...action.payload };
    }
    return newState;
  };
  return userReducer;
};

const servicesReducer: Reducer<Redux.IServicesStore, Redux.IAction<any>> = (
  state: Redux.IServicesStore = { data: [], count: 0, loading: false },
  action: Redux.IAction<any>
): Redux.IServicesStore => {
  let newState = { ...state };
  if (action.type === ApplicationActionTypes.Services.Response) {
    newState = { ...state, data: action.payload.data, count: action.payload.count };
  } else if (action.type === ApplicationActionTypes.Services.Loading) {
    newState = { ...state, loading: action.payload };
  } else if (action.type === ApplicationActionTypes.Services.AddCapabilities) {
    const existingService = find(state.data, { service: action.payload.service });
    if (!isNil(existingService)) {
      const newService = { ...existingService, capabilities: action.payload.capabilities };
      newState = {
        ...state,
        data: replaceInArray<IService>(state.data, { service: action.payload.service }, newService)
      };
    } else {
      /* eslint-disable no-console */
      console.warn(
        `Inconsistent State!: Inconsistent state found when adding capabilities to
        service ${action.payload.service} - the service is not in the state.`
      );
    }
  }
  return newState;
};

/**
 * Creates the base application reducer that bundles up the reducers from the
 * individual modules with other top level reducers.
 *
 * @param config  The application Redux configuration.
 * @param user   The User object returned from the JWT token validation.
 */
const createApplicationReducer = (config: Redux.IApplicationConfig, user: IUser): any => {
  let moduleReducers: { [key: string]: Reducer<Redux.IModuleStore, Redux.IAction> } = {};
  forEach(config, (moduleConfig: Redux.IModuleConfig<any, any>) => {
    moduleReducers[moduleConfig.label] = createWrappedModuleReducer(moduleConfig);
  });
  return combineReducers({
    ...moduleReducers,
    user: createUserReducer(user),
    organizations: createListResponseReducer<
      IOrganization,
      Redux.IListResponseStore<IOrganization>,
      Redux.IAction<any>
    >(
      {
        Response: ApplicationActionTypes.Organizations.Response,
        Request: ApplicationActionTypes.Organizations.Request,
        Loading: ApplicationActionTypes.Organizations.Loading,
        AddToState: ApplicationActionTypes.Organizations.AddToState,
        RemoveFromState: ApplicationActionTypes.Organizations.RemoveFromState,
        UpdateInState: ApplicationActionTypes.Organizations.UpdateInState
      },
      {
        referenceEntity: "organization"
      }
    ),
    services: servicesReducer,
    organization: createUserOrganizationReducer(user.organization.id)
  });
};

export default createApplicationReducer;
