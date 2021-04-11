import { useSelector } from "react-redux";

import { BudgetItemTreeDropdown } from "components/dropdowns";
import { simpleDeepEqualSelector } from "store/selectors";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetItemCellProps extends StandardCellProps<Table.ActualRow> {
  onChange: (object_id: number, parent_type: string, row: Table.ActualRow) => void;
}

const selectBudgetItemsTree = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.budgetItemsTree);

const BudgetItemCell = ({ onChange, ...props }: BudgetItemCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the budget items in the state change.
  const budgetItemsTree = useSelector(selectBudgetItemsTree);

  return (
    <Cell {...props}>
      <BudgetItemTreeDropdown
        value={props.node.data.object_id}
        onChange={(nd: IBudgetItem) => onChange(nd.id, nd.type, props.node.data)}
        nodes={budgetItemsTree.data}
        buttonProps={{ style: { width: "100%" }, textProps: { style: { textAlign: "left" } } }}
      />
    </Cell>
  );
};

export default BudgetItemCell;
