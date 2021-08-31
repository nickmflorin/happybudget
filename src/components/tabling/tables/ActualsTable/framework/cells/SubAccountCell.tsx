import { EntityText } from "components/typography";
import { isNil } from "lodash";
import { Cell } from "components/tabling/generic/framework/cells";

type SubAccountCellProps = Table.CellProps<
  Tables.ActualRowData,
  Model.Actual,
  Tables.ActualTableStore,
  Model.SimpleAccount | Model.SimpleSubAccount | null
>;

const SubAccountCell = ({ value, ...props }: SubAccountCellProps): JSX.Element => {
  return <Cell {...props}>{!isNil(value) && <EntityText fillEmpty={"---------"}>{value}</EntityText>}</Cell>;
};

export default SubAccountCell;
