export const initialListResponseState: Redux.ListResponseStore<any> = {
  loading: false,
  data: [],
  count: 0,
  responseWasReceived: false
};

export const initialReadOnlyModelListResponseState: Redux.ReadOnlyModelListResponseStore<any> = {
  ...initialListResponseState,
  search: "",
  cache: {}
};

export const initialModelListResponseState: Redux.ModelListResponseStore<any> = {
  ...initialReadOnlyModelListResponseState,
  selected: [],
  creating: false,
  deleting: [],
  updating: []
};

export const initialTableState: Redux.TableStore<any> = {
  ...initialModelListResponseState
};

export const initialReadOnlyTableState: Redux.ReadOnlyTableStore<any> = {
  ...initialReadOnlyModelListResponseState
};

export const initialBudgetTableState: Redux.BudgetTableStore<any> = {
  ...initialTableState,
  groups: initialTableState
};

export const initialReadOnlyBudgetTableState: Redux.ReadOnlyBudgetTableStore<any> = {
  ...initialReadOnlyTableState,
  groups: initialReadOnlyTableState
};

export const initialBudgetTableWithFringesState: Redux.BudgetTableWithFringesStore<any> = {
  ...initialBudgetTableState,
  fringes: initialTableState
};

export const initialReadOnlyBudgetTableWithFringesState: Redux.ReadOnlyBudgetTableWithFringesStore<any> = {
  ...initialReadOnlyBudgetTableState,
  fringes: initialReadOnlyTableState
};

export const initialReadOnlyDetailResponseState: Redux.ReadOnlyModelDetailResponseStore<any> = {
  loading: false,
  data: undefined,
  responseWasReceived: false
};

export const initialDetailResponseState: Redux.ModelDetailResponseStore<any> = {
  ...initialReadOnlyDetailResponseState
};

export const initialCommentsListResponseState: Redux.CommentsListResponseStore = {
  ...initialModelListResponseState,
  replying: []
};
