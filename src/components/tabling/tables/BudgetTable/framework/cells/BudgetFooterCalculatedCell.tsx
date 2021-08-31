import { useSelector } from "react-redux";
import { redux } from "lib";
import { CalculatedCell, CalculatedCellProps } from "components/tabling/generic/framework/cells";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
// TODO: This will not work for templates!  We need to send in a table prop that allows us to select
// the budget detail store.
const selectBudgetLoading = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.detail.loading
);

/* eslint-disable indent */
const BudgetFooterCalculatedCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.BudgetTableStore<R, M>
>({
  renderRedIfNegative = true,
  ...props
}: CalculatedCellProps<R, M, S>): JSX.Element => {
  const loading = useSelector(selectBudgetLoading);
  return <CalculatedCell<R, M, S> {...props} renderRedIfNegative={renderRedIfNegative} loading={loading} />;
};

export default BudgetFooterCalculatedCell;
