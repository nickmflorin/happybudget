import { forwardRef } from "react";
import { PaymentMethods } from "lib/model";

import ChoiceCellEditor, { ChoiceCellEditorProps } from "./Generic";

const PaymentMethodCellEditor = (
  props: Omit<
    ChoiceCellEditorProps<BudgetTable.ActualRow, Model.Actual, Model.PaymentMethod>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  return (
    <ChoiceCellEditor<BudgetTable.ActualRow, Model.Actual, Model.PaymentMethod>
      searchIndices={["name"]}
      models={PaymentMethods}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(PaymentMethodCellEditor);
