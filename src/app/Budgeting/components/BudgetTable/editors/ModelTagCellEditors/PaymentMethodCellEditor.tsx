import { forwardRef } from "react";
import { PaymentMethods } from "lib/model";

import ModelTagCellEditor, { ModelTagCellEditorProps } from "./Generic";

const PaymentMethodCellEditor = (props: ModelTagCellEditorProps, ref: any) => {
  return (
    <ModelTagCellEditor<Model.PaymentMethod>
      searchIndices={["name"]}
      models={PaymentMethods}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(PaymentMethodCellEditor);
