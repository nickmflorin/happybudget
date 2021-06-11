import { EntityText } from "components/typography";
import { isNil } from "lodash";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetItemCellProps extends StandardCellProps<BudgetTable.ActualRow> {
  readonly children: Model.SimpleAccount | Model.SimpleSubAccount | null;
}

const BudgetItemCell = (props: BudgetItemCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      {!isNil(props.children) && <EntityText fillEmpty={"---------"}>{props.children}</EntityText>}
    </Cell>
  );
};

export default BudgetItemCell;
