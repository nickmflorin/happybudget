import { forEach } from "lodash";

export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  page: 1,
  pageSize: 10,
  search: "",
  selected: [],
  responseWasReceived: false,
  creating: false,
  deleting: [],
  updating: []
};

export const initialDetailResponseState: Redux.DetailResponseStore<any> = {
  loading: false,
  data: undefined,
  responseWasReceived: false
};

export const initialCommentsListResponseState: Redux.CommentsListResponseStore = {
  ...initialListResponseState,
  replying: []
};

export const initialLoadingState: Redux.LoadingStore = {
  elements: [],
  loading: false
};

export const createInitialUserState = (user: Model.User): Redux.UserStore => {
  return {
    ...user
  };
};

const createApplicationInitialState = (config: Redux.ApplicationConfig, user: Model.User): Redux.ApplicationStore => {
  const moduleInitialStates: { [key: string]: Redux.ModuleStore } = {};
  forEach(config, (moduleConfig: Redux.ModuleConfig<any, any>) => {
    if (typeof moduleConfig.initialState === "function") {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState();
    } else {
      moduleInitialStates[moduleConfig.label] = moduleConfig.initialState;
    }
  });
  return {
    user: createInitialUserState(user),
    drawerVisible: false
  } as Redux.ApplicationStore;
};

export default createApplicationInitialState;
