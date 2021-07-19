import { isNil } from "lodash";
import { useMemo } from "react";
import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const SubAccountUnitCell = (props: ModelTagCellProps<Model.Tag>): JSX.Element => {
  const isPlural = useMemo(() => {
    const row: BudgetTable.SubAccountRow = props.node.data;
    if (!isNil(row.quantity) && row.quantity > 1) {
      return true;
    }
    return false;
  }, [props.node]);

  return <ModelTagCell {...props} tagProps={{ isPlural }} leftAlign={true} />;
};

export default SubAccountUnitCell;
