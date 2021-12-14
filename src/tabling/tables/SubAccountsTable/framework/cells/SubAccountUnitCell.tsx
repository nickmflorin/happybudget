import React from "react";
import { isNil } from "lodash";
import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

const SubAccountUnitCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.SubAccountRowData,
    Model.SubAccount,
    Tables.SubAccountTableStore,
    Model.Tag
  >
): JSX.Element => {
  const row: Table.BodyRow<Tables.SubAccountRowData> = props.node.data;
  return <ModelTagCell {...props} tagProps={{ isPlural: !isNil(row.data.quantity) && row.data.quantity > 1 }} />;
};

export default React.memo(SubAccountUnitCell);
