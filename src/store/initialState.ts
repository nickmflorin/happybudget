import { forEach } from "lodash";

export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false
};

export const initialModelListResponseState: Redux.ModelListResponseStore<any> = {
  ...initialListResponseState,
  page: 1,
  pageSize: 10,
  search: "",
  selected: [],
  creating: false,
  deleting: [],
  updating: [],
  objLoading: []
};

export const initialDetailResponseState: Redux.ModelDetailResponseStore<any> = {
  loading: false,
  data: undefined,
  responseWasReceived: false
};

export const initialCommentsListResponseState: Redux.CommentsListResponseStore = {
  ...initialModelListResponseState,
  replying: []
};

export const createInitialUserState = (user: Model.User): Modules.UserStore => {
  return {
    ...user
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
