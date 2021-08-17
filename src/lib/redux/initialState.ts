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
  cache: {}
};

export const initialTableState: Redux.TableStore<any> = {
  ...initialModelListResponseState
};

export const initialBudgetTableState: Redux.BudgetTableStore<any> = {
  ...initialTableState,
  groups: initialTableState
};

export const initialBudgetTableWithFringesState: Redux.BudgetTableWithFringesStore<any> = {
  ...initialBudgetTableState,
  fringes: initialTableState
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
