import React from "react";
import { isNil } from "lodash";

import { Cell } from "components/tabling/generic/framework/cells";
import { Tag } from "components/tagging";

type ActualOwnerCellProps = Table.CellProps<
  Tables.ActualRowData,
  Model.Actual,
  Tables.ActualTableStore,
  Model.SimpleAccount | Model.SimpleSubAccount | null
>;

const ActualOwnerCell = ({ value, ...props }: ActualOwnerCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      {!isNil(value) && <Tag className={"tag--account"} text={value.description || value.identifier} />}
    </Cell>
  );
};

export default React.memo(ActualOwnerCell);
