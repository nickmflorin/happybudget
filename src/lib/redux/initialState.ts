/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialModelListResponseState: Redux.ModelListResponseStore<any> = {
  ...initialListResponseState
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialAuthenticatedModelListResponseState: Redux.AuthenticatedModelListResponseStore<any> = {
  ...initialModelListResponseState,
  search: "",
  page: 1,
  pageSize: 10,
  selected: [],
  creating: false,
  deleting: [],
  updating: [],
  ordering: []
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialTableState: Redux.TableStore<any> = {
  data: [],
  loading: false,
  search: "",
  saving: false
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const initialDetailResponseState: Redux.ModelDetailResponseStore<any> = {
  loading: false,
  data: null
};
