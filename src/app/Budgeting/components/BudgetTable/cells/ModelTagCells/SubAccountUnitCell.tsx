import { isNil } from "lodash";
import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const SubAccountUnitCell = (props: ModelTagCellProps<Model.Tag>): JSX.Element => {
  const row: BudgetTable.SubAccountRow = props.node.data;
  return <ModelTagCell {...props} tagProps={{ isPlural: !isNil(row.quantity) && row.quantity > 1 }} leftAlign={true} />;
};

export default SubAccountUnitCell;
