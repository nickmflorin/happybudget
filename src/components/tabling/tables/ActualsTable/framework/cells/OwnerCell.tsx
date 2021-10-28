import { isNil } from "lodash";

import { Cell } from "components/tabling/generic/framework/cells";
import { Tag } from "components/tagging";

type OwnerCellProps = Table.CellProps<
  Tables.ActualRowData,
  Model.Actual,
  Tables.ActualTableStore,
  Model.SimpleAccount | Model.SimpleSubAccount | null
>;

const OwnerCell = ({ value, ...props }: OwnerCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      {!isNil(value) && <Tag className={"tag--account"} text={value.description || value.identifier} />}
    </Cell>
  );
};

export default OwnerCell;
