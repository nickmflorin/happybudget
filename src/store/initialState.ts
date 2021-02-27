import { forEach } from "lodash";

export const initialListResponseState = {
  loading: false,
  data: [],
  count: 0,
  page: 1,
  pageSize: 10,
  search: "",
  selected: [],
  responseWasReceived: false
};

export const initialDetailResponseState = {
  loading: false,
  data: undefined,
  id: undefined,
  responseWasReceived: false
};

/**
 * Creates the initial state for the reducer that handles state changes to the
 * Organization that the User in the Redux store belongs to. The initial state
 * for the reducer is constructed with the provided Organization ID.
 *
 * @param orgId   The Organization ID of the currently logged in User.
 */
export const createInitialOrganizationState = (orgId: number): Redux.IOrganizationStore => {
  return {
    id: orgId,
    data: undefined,
    users: initialListResponseState
  };
};

/**
 * Creates the initial state for the reducer that handles state changes to the
 * User in the Redux store. The initial state for the reducer is constructed with
 * the provided Organization ID and User Role.
 *
 * @param user   The User object returned from the JWT token validation.
 */
export const createInitialUserState = (user: IUser): Redux.IUserStore => {
  return {
    ...user
  };
};

/**
 * Creates the base application store's initial state by bundling up the initial
 * states from the individual module level stores with the top level stores.
 *
 * @param user   The User object returned from the JWT token validation.
 */
const createApplicationInitialState = (config: Redux.IApplicationConfig, user: IUser): Redux.IApplicationStore => {
  const moduleInitialStates: { [key: string]: Redux.IModuleStore } = {};
  forEach(config, (moduleConfig: Redux.IModuleConfig<any, any>) => {
    if (typeof moduleConfig.initialState === "function") {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState();
    } else {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState;
    }
  });
  return {
    user: createInitialUserState(user),
    organization: createInitialOrganizationState(user.organization.id),
    ...moduleInitialStates
  } as Redux.IApplicationStore;
};

export default createApplicationInitialState;
