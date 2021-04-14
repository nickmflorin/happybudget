import { Reducer, combineReducers } from "redux";
import { forEach, isNil, includes, filter } from "lodash";
import { ApplicationActionTypes } from "./actions";
import { createInitialUserState, initialLoadingState } from "./initialState";
import { createSimpleBooleanReducer } from "../lib/redux/factories";

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
  config: Redux.ModuleConfig<any, any>
): Reducer<Redux.ModuleStore, Redux.Action<any>> => {
  const wrapped: Reducer<Redux.ModuleStore, Redux.Action<any>> = (
    state: Redux.ModuleStore = config.initialState,
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
const createUserReducer = (user: Model.User): Reducer<Redux.UserStore, Redux.Action<any>> => {
  const initialUserState = createInitialUserState(user);
  const userReducer: Reducer<Redux.UserStore, Redux.Action<any>> = (
    state: Redux.UserStore = initialUserState,
    action: Redux.Action<any>
  ): Redux.UserStore => {
    let newState = { ...state };
    if (action.type === ApplicationActionTypes.User.UpdateInState) {
      newState = { ...newState, ...action.payload };
    }
    return newState;
  };
  return userReducer;
};

const loadingReducer: Reducer<Redux.LoadingStore, Redux.Action<any>> = (
  state: Redux.LoadingStore = initialLoadingState,
  action: Redux.Action<any>
): Redux.LoadingStore => {
  let newState = { ...state };
  if (!isNil(action.payload)) {
    if (action.type === ApplicationActionTypes.SetApplicationLoading) {
      const { id, value } = action.payload;
      if (value === false) {
        if (!includes(newState.elements, id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when removing element from loading
            state... the element with ID ${id} does not exist in state when it is expected to.`
          );
        } else {
          newState = {
            ...newState,
            elements: filter(newState.elements, (element: string) => element !== id)
          };
        }
      } else {
        if (includes(newState.elements, id)) {
          /* eslint-disable no-console */
          console.warn(
            `Inconsistent State!  Inconsistent state noticed when adding element to loading
            state... the element with ID ${id} already exists in state when it is not expected to.`
          );
        } else {
          newState = { ...newState, elements: [...newState.elements, id] };
        }
      }
    } else if (action.type === ApplicationActionTypes.SetOverallApplicationLoading) {
      newState = { ...newState, loading: action.payload };
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
const createApplicationReducer = (config: Redux.ApplicationConfig, user: Model.User): any => {
  let moduleReducers: { [key: string]: Reducer<Redux.ModuleStore, Redux.Action> } = {};
  forEach(config, (moduleConfig: Redux.ModuleConfig<any, any>) => {
    moduleReducers[moduleConfig.label] = createWrappedModuleReducer(moduleConfig);
  });
  return combineReducers({
    ...moduleReducers,
    user: createUserReducer(user),
    drawerVisible: createSimpleBooleanReducer(ApplicationActionTypes.SetDrawerVisibility),
    loading: loadingReducer
  });
};

export default createApplicationReducer;
