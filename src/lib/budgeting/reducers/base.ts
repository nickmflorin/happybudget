import * as tabling from "../../tabling";

/* eslint-disable indent */
export const createBudgetTableReducer = <
  R extends Tables.AccountRowData | Tables.SubAccountRowData,
  M extends Model.Account | Model.SubAccount,
  S extends Redux.TableStore<R, M, Model.BudgetGroup> = Redux.TableStore<R, M, Model.BudgetGroup>
>(
  config: Redux.TableReducerConfig<R, M, Model.BudgetGroup, S> & {
    readonly recalculateRow?: (state: S, action: Redux.Action, row: Table.DataRow<R, M>) => Table.DataRow<R, M>;
    readonly recalculateGroup?: (state: S, action: Redux.Action, group: Model.BudgetGroup) => Model.BudgetGroup;
  }
): Redux.Reducer<S> => {
  return tabling.reducers.createTableReducer<R, M, Model.BudgetGroup, S>(config);
};
