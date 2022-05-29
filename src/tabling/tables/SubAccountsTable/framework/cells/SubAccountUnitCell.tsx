import React from "react";
import { isNil } from "lodash";
import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

const SubAccountUnitCell = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean = boolean
>(
  props: framework.cells.ModelTagCellProps<
    Tables.SubAccountRowData,
    Model.SubAccount,
    SubAccountsTableActionContext<B, P, PUBLIC>,
    Tables.SubAccountTableStore,
    Model.Tag
  >
): JSX.Element => {
  const row: Table.ModelRow<Tables.SubAccountRowData> = props.node.data;
  return <ModelTagCell {...props} tagProps={{ isPlural: !isNil(row.data.quantity) && row.data.quantity > 1 }} />;
};

export default React.memo(SubAccountUnitCell) as typeof SubAccountUnitCell;
