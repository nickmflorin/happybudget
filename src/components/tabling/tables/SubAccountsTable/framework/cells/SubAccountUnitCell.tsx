import { isNil } from "lodash";
import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const SubAccountUnitCell = (
  props: framework.cells.ModelTagCellProps<Tables.SubAccountRow, Model.SubAccount, Model.Tag>
): JSX.Element => {
  const row: Tables.SubAccountRow = props.node.data;
  return <ModelTagCell {...props} tagProps={{ isPlural: !isNil(row.quantity) && row.quantity > 1 }} leftAlign={true} />;
};

export default SubAccountUnitCell;
