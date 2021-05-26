import { EntityText } from "components/typography";
import { isNil } from "lodash";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetItemCellProps extends StandardCellProps<Table.ActualRow> {
  readonly value: Model.SimpleAccount | Model.SimpleSubAccount | null;
}

const BudgetItemCell = (props: BudgetItemCellProps): JSX.Element => {
  return (
    <Cell {...props}>{!isNil(props.value) && <EntityText fillEmpty={"---------"}>{props.value}</EntityText>}</Cell>
  );
};

export default BudgetItemCell;
