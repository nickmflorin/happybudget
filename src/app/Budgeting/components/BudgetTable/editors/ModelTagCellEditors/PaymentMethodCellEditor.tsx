import { forwardRef } from "react";
import { PaymentMethods } from "lib/model";

import { ICellEditorParams } from "@ag-grid-community/core";
import ModelTagCellEditor from "./Generic";

const PaymentMethodCellEditor = (props: ICellEditorParams, ref: any) => {
  return <ModelTagCellEditor<Model.PaymentMethod> models={PaymentMethods} forwardedRef={ref} {...props} />;
};

export default forwardRef(PaymentMethodCellEditor);
