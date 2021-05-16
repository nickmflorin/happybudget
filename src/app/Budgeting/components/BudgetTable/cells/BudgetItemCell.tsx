import { EntityText } from "components/typography";
import { isNil } from "lodash";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetItemCellProps extends StandardCellProps<Table.ActualRow> {
  readonly onChange: (object_id: number, parent_type: string, row: Table.ActualRow) => void;
  readonly value: Model.SimpleAccount | Model.SimpleSubAccount | null;
}

const BudgetItemCell = ({ onChange, ...props }: BudgetItemCellProps): JSX.Element => {
  return (
    <Cell {...props}>{!isNil(props.value) && <EntityText fillEmpty={"---------"}>{props.value}</EntityText>}</Cell>
  );
};

export default BudgetItemCell;
