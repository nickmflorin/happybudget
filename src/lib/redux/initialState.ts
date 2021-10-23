export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false
};

export const initialModelListResponseState: Redux.ModelListResponseStore<any> = {
  ...initialListResponseState,
  search: "",
  cache: {},
  selected: [],
  creating: false,
  deleting: [],
  updating: []
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
