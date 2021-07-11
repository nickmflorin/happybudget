import { EntityText } from "components/typography";
import { isNil } from "lodash";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetItemCellProps extends StandardCellProps {
  readonly children: Model.SimpleAccount | Model.SimpleSubAccount | null;
}

const BudgetItemCell = (props: BudgetItemCellProps): JSX.Element => {
  const row: BudgetTable.ActualRow = props.node.data;
  if (row.meta.isTableFooter === true) {
    return <Cell {...props}>{props.children}</Cell>;
  }
  return (
    <Cell {...props}>
      {!isNil(props.children) && <EntityText fillEmpty={"---------"}>{props.children}</EntityText>}
    </Cell>
  );
};

export default BudgetItemCell;
