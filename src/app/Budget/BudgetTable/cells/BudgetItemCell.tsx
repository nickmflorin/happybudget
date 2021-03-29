import { useSelector } from "react-redux";
import { ICellRendererParams, RowNode } from "ag-grid-community";

import { BudgetItemsTreeSelect } from "components/control/dropdowns";

interface UnitCellProps extends ICellRendererParams {
  onChange: (object_id: number, parent_type: string, row: Table.ActualRow) => void;
  node: RowNode;
}

const BudgetItemCell = ({ node, onChange }: UnitCellProps): JSX.Element => {
  const budgetItemsTree = useSelector((state: Redux.IApplicationStore) => state.actuals.budgetItemsTree);

  return (
    <BudgetItemsTreeSelect
      value={node.data.object_id}
      onChange={(nd: IBudgetItem) => onChange(nd.id, nd.type, node.data)}
      nodes={budgetItemsTree.data}
    />
  );
};

export default BudgetItemCell;
