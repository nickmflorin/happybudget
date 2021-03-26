import { forEach } from "lodash";

export const initialListResponseState: Redux.IListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  page: 1,
  pageSize: 10,
  search: "",
  selected: [],
  responseWasReceived: false
};

export const initialDetailResponseState: Redux.IDetailResponseStore<any> = {
  loading: false,
  data: undefined,
  responseWasReceived: false
};

export const initialCommentsListResponseState: Redux.ICommentsListResponseStore = {
  ...initialListResponseState,
  submitting: false,
  deleting: [],
  editing: [],
  replying: []
};

export const initialLoadingState: Redux.ILoadingStore = {
  elements: [],
  loading: false
};

export const createInitialUserState = (user: IUser): Redux.IUserStore => {
  return {
    ...user
  };
};

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
    drawerVisible: false
  } as Redux.IApplicationStore;
};

export default createApplicationInitialState;
