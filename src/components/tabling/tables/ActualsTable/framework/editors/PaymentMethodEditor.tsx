import { forwardRef } from "react";
import { model } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceEditor } from "components/tabling/generic/framework/editors";

const PaymentMethodEditor = (
  props: Omit<
    framework.editors.ChoiceEditorProps<Tables.ActualRow, Model.Actual, Model.PaymentMethod>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  return (
    <ChoiceEditor<Tables.ActualRow, Model.Actual, Model.PaymentMethod>
      searchIndices={["name"]}
      models={model.models.PaymentMethods}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(PaymentMethodEditor);
