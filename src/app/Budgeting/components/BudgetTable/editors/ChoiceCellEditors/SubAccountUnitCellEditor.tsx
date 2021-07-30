import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { selectSubAccountUnits } from "../../../../store/selectors";
import ChoiceCellEditor, { ChoiceCellEditorProps } from "./Generic";

const SubAccountUnitCellEditor = (
  props: Omit<
    ChoiceCellEditorProps<BudgetTable.SubAccountRow, Model.SubAccount, Model.Tag>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  const units = useSelector(selectSubAccountUnits);
  const row: BudgetTable.SubAccountRow = props.node.data;
  return (
    <ChoiceCellEditor<BudgetTable.SubAccountRow, Model.SubAccount, Model.Tag>
      style={{ maxHeight: 300 }}
      searchIndices={["title"]}
      models={units}
      forwardedRef={ref}
      tagProps={{ isPlural: !isNil(row.quantity) && row.quantity > 1 }}
      {...props}
    />
  );
};

export default forwardRef(SubAccountUnitCellEditor);
