export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false
};

export const initialModelListResponseState: Redux.ModelListResponseStore<any> = {
  ...initialListResponseState
};

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

export const initialTableState: Redux.TableStore<any> = {
  data: [],
  loading: false,
  search: "",
  saving: false
};

export const initialDetailResponseState: Redux.ModelDetailResponseStore<any> = {
  loading: false,
  data: undefined
};
