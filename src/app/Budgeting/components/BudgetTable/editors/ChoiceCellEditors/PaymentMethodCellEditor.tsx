import { forwardRef } from "react";
import { PaymentMethods } from "lib/model";

import ChoiceCellEditor, { ChoiceCellEditorProps } from "./Generic";

const PaymentMethodCellEditor = (
  props: Omit<ChoiceCellEditorProps<Model.PaymentMethod>, "models" | "searchIndices">,
  ref: any
) => {
  return (
    <ChoiceCellEditor<Model.PaymentMethod>
      searchIndices={["name"]}
      models={PaymentMethods}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(PaymentMethodCellEditor);
