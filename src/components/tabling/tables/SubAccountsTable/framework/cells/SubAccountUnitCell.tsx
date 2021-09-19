import { isNil } from "lodash";
import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const SubAccountUnitCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.SubAccountRowData,
    Model.SubAccount,
    Model.BudgetGroup,
    Tables.SubAccountTableStore,
    Model.Tag
  >
): JSX.Element => {
  const row: Table.Row<Tables.SubAccountRowData, Model.SubAccount> = props.node.data;
  return (
    <ModelTagCell
      {...props}
      tagProps={{ isPlural: !isNil(row.data.quantity) && row.data.quantity > 1 }}
      leftAlign={true}
    />
  );
};

export default SubAccountUnitCell;
