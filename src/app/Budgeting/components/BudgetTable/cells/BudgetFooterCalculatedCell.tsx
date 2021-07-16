import { useSelector } from "react-redux";

import { simpleDeepEqualSelector } from "store/selectors";
import CalculatedCell, { CalculatedCellProps } from "./CalculatedCell";

const selectBudgetLoading = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.detail.loading
);

const BudgetFooterCalculatedCell = <R extends Table.Row>({
  renderRedIfNegative = true,
  ...props
}: CalculatedCellProps<R>): JSX.Element => {
  const loading = useSelector(selectBudgetLoading);
  return <CalculatedCell<R> {...props} renderRedIfNegative={renderRedIfNegative} loading={loading} />;
};

export default BudgetFooterCalculatedCell;
