import { forEach } from "lodash";
import { redux } from "lib";

export const initialContactsState: Modules.ContactsStore = {
  table: redux.initialState.initialTableState
};

export const createInitialUserState = (user: Model.User): Modules.UserStore => {
  return {
    ...user,
    contacts: initialContactsState
  };
};

const createApplicationInitialState = (
  config: Modules.ApplicationConfig,
  user: Model.User
): Modules.ApplicationStore => {
  const moduleInitialStates: { [key: string]: Modules.ModuleStore } = {};
  forEach(config, (moduleConfig: Modules.ModuleConfig<any, any>) => {
    if (typeof moduleConfig.initialState === "function") {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState();
    } else {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState;
    }
  });
  return {
    user: createInitialUserState(user),
    drawerVisible: false,
    loading: false
  } as Modules.ApplicationStore;
};

export default createApplicationInitialState;
