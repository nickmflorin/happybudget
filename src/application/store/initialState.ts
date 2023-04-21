import * as api from "../api";

import * as types from "./types";

export const initialListResponseState = <
  M extends api.ListResponseIteree,
>(): types.ListStore<M> => ({
  loading: false,
  data: [] as M[],
  count: 0,
  responseWasReceived: false,
  error: null,
  query: {},
  invalidated: false,
});

export const initialApiModelListResponseState = <
  M extends import("lib/model/types").ApiModel,
>(): types.ApiModelListStore<M> => ({
  ...initialListResponseState<M>(),
});

export const initialAuthenticatedApiModelListResponseState = <
  M extends import("lib/model/types").ApiModel,
>(): types.AuthenticatedApiModelListStore<M> => ({
  ...initialApiModelListResponseState<M>(),
  search: "",
  page: 1,
  pageSize: 10,
  creating: false,
  deleting: { current: [], completed: [], failed: [] },
  updating: { current: [], completed: [], failed: [] },
  ordering: [],
  error: null,
});

export const initialTableState = <
  R extends import("lib/tabling/rows/types").Row,
>(): types.TableStore<R> => ({
  data: [],
  loading: false,
  search: "",
  eventHistory: [],
  eventIndex: -1,
  responseWasReceived: false,
  error: null,
  invalidated: false,
});

export const initialDetailResponseState = <
  M extends import("lib/model/types").ApiModel,
>(): types.ApiModelDetailStore<M> => ({
  loading: false,
  data: null,
  error: null,
  invalidated: false,
});

export const createApplicationInitialState = (
  storeConfig: types.StoreConfig,
): types.ApplicationStore => ({
  // ...config.AUTH_MODULE_INITIAL_STATE,
  user: storeConfig.user,
  loading: false,
  drawerOpen: false,
  contacts:
    initialAuthenticatedApiModelListResponseState<import("lib/model/contact/types").Contact>(),
  filteredContacts:
    initialAuthenticatedApiModelListResponseState<import("lib/model/contact/types").Contact>(),
  fringeColors: initialListResponseState<string>(),
  subaccountUnits:
    initialApiModelListResponseState<import("lib/model/budgeting/types").SubAccountUnit>(),
  actualTypes: initialApiModelListResponseState<import("lib/model/budgeting/types").ActualType>(),
  productPermissionModalOpen: false,
  public: {
    // ...config.PUBLIC_MODULE_INITIAL_STATE,
    tokenId: storeConfig.tokenId,
  } as types.PublicStore,
});
