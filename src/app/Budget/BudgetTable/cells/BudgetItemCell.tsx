import { useSelector } from "react-redux";
import { ICellRendererParams, RowNode } from "ag-grid-community";

import { BudgetItemsTreeSelect } from "components/control/dropdowns";
import { simpleDeepEqualSelector } from "store/selectors";

interface BudgetItemCellProps extends ICellRendererParams {
  onChange: (object_id: number, parent_type: string, row: Table.ActualRow) => void;
  node: RowNode;
}

const selectBudgetItemsTree = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.budgetItemsTree);

const BudgetItemCell = ({ node, onChange }: BudgetItemCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the budget items in the state change.
  const budgetItemsTree = useSelector(selectBudgetItemsTree);

  return (
    <BudgetItemsTreeSelect
      value={node.data.object_id}
      onChange={(nd: IBudgetItem) => onChange(nd.id, nd.type, node.data)}
      nodes={budgetItemsTree.data}
    />
  );
};

export default BudgetItemCell;
