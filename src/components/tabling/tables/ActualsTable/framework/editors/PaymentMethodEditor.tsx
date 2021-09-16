import { ForwardedRef, forwardRef } from "react";

import { model } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceSelectEditor } from "components/tabling/generic/framework/editors";

const PaymentMethodEditor = (
  props: Omit<
    framework.editors.ChoiceSelectEditorProps<
      Model.PaymentMethod,
      Tables.ActualRowData,
      Model.Actual,
      Tables.ActualTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<any>
) => {
  return (
    <ChoiceSelectEditor<Model.PaymentMethod, Tables.ActualRowData, Model.Actual, Tables.ActualTableStore>
      searchIndices={["name"]}
      ref={ref}
      models={model.models.PaymentMethods}
      {...props}
    />
  );
};

export default forwardRef(PaymentMethodEditor);
