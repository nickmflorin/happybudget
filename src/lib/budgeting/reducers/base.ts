import * as tabling from "../../tabling";

/* eslint-disable indent */
export const createBudgetTableReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M, Model.BudgetGroup> = Redux.TableStore<R, M, Model.BudgetGroup>
>(
  config: Table.ReducerConfig<R, M, Model.BudgetGroup, S>
): Redux.Reducer<S> => {
  return tabling.reducers.createTableReducer<R, M, Model.BudgetGroup, S>(config);
};
