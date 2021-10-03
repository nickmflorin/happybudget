import { EntityText } from "components/typography";
import { isNil } from "lodash";
import { Cell } from "components/tabling/generic/framework/cells";

type OwnerCellProps = Table.CellProps<
  Tables.ActualRowData,
  Model.Actual,
  Tables.ActualTableStore,
  Model.SimpleAccount | Model.SimpleSubAccount | null
>;

const OwnerCell = ({ value, ...props }: OwnerCellProps): JSX.Element => {
  return <Cell {...props}>{!isNil(value) && <EntityText fillEmpty={"---------"}>{value}</EntityText>}</Cell>;
};

export default OwnerCell;
