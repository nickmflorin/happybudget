/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialListResponseState: Redux.ListStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false,
  error: null,
  query: {},
  invalidated: false
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialModelListResponseState: Redux.ModelListStore<any> = {
  ...initialListResponseState
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
  error: null
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
  invalidated: false
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialDetailResponseState: Redux.ModelDetailStore<any> = {
  loading: false,
  data: null,
  error: null,
  invalidated: false
};
