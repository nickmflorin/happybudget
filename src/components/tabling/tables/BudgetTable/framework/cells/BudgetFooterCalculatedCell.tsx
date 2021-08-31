import { useSelector } from "react-redux";
import { redux } from "lib";
import { CalculatedCell, CalculatedCellProps } from "components/tabling/generic/framework/cells";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
const selectBudgetLoading = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.StoreObj) => state.budget.budget.budget.detail.loading
);

const BudgetFooterCalculatedCell = <R extends Table.Row, M extends Model.Model>({
  renderRedIfNegative = true,
  ...props
}: CalculatedCellProps<R, M>): JSX.Element => {
  const loading = useSelector(selectBudgetLoading);
  return <CalculatedCell<R, M> {...props} renderRedIfNegative={renderRedIfNegative} loading={loading} />;
};

export default BudgetFooterCalculatedCell;
