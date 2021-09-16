export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0
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

export const initialTableState: Redux.TableStore<any, any> = {
  data: [],
  loading: false,
  groups: [],
  models: [],
  search: "",
  saving: false
};

export const initialDetailResponseState: Redux.ModelDetailResponseStore<any> = {
  loading: false,
  data: undefined
};
