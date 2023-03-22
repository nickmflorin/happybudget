import { reduce, filter } from "lodash";

import { redux } from "lib";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialListResponseState: Redux.ListStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false,
  error: null,
  query: {},
  invalidated: false,
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialModelListResponseState: Redux.ModelListStore<any> = {
  ...initialListResponseState,
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialAuthenticatedModelListResponseState: Redux.AuthenticatedModelListStore<any> = {
  ...initialModelListResponseState,
  search: "",
  page: 1,
  pageSize: 10,
  creating: false,
  deleting: { current: [], completed: [], failed: [] },
  updating: { current: [], completed: [], failed: [] },
  ordering: [],
  error: null,
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialTableState: Redux.TableStore<any> = {
  data: [],
  loading: false,
  search: "",
  eventHistory: [],
  eventIndex: -1,
  responseWasReceived: false,
  error: null,
  invalidated: false,
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialDetailResponseState: Redux.ModelDetailStore<any> = {
  loading: false,
  data: null,
  error: null,
  invalidated: false,
};

const createModularApplicationState = <
  S extends Application.AuthenticatedModuleStores | Application.PublicModuleStores,
>(
  config: Application.ModuleConfig[],
): S =>
  reduce(
    config,
    (prev: S, moduleConfig: Application.ModuleConfig) => {
      if (typeof moduleConfig.initialState === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        return { ...prev, [moduleConfig.label]: moduleConfig.initialState() };
      }
      return { ...prev, [moduleConfig.label]: moduleConfig.initialState };
    },
    {} as S,
  );

const createPublicInitialState = (config: Application.StoreConfig): Application.PublicStore => ({
  ...createModularApplicationState(
    filter(config.modules, (c: Application.ModuleConfig) => c.isPublic === true),
  ),
  tokenId: config.tokenId,
});

const createApplicationInitialState = (config: Application.StoreConfig): Application.Store => ({
  ...createModularApplicationState(
    filter(config.modules, (c: Application.ModuleConfig) => c.isPublic !== true),
  ),
  user: config.user,
  loading: false,
  drawerOpen: false,
  contacts: redux.initialAuthenticatedModelListResponseState,
  filteredContacts: redux.initialAuthenticatedModelListResponseState,
  productPermissionModalOpen: false,
  public: createPublicInitialState(config),
});

export default createApplicationInitialState;
