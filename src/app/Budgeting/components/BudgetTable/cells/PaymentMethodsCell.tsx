import { useMemo } from "react";
import { isNil } from "lodash";
import { ChoiceTagsDropdown } from "components/dropdowns";
import { PaymentMethods } from "lib/model";
import { findChoiceForId, findChoiceForName } from "lib/model/util";
import Cell, { StandardCellProps } from "./Cell";

interface PaymentMethodCellProps extends StandardCellProps<Table.ActualRow> {
  value: Model.PaymentMethodName | null;
}

const PaymentMethodCell = ({ ...props }: PaymentMethodCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceForName(PaymentMethods, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceTagsDropdown<Model.PaymentMethod, Model.PaymentMethodId, Model.PaymentMethodName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={PaymentMethods}
        onChange={(unit: Model.PaymentMethodId) => {
          const m = findChoiceForId(PaymentMethods, unit);
          if (!isNil(m)) {
            // We need to use the ID as an internal reference to the model for the
            // Model.ChoiceTagsDropdown component (via the `value` prop) but we need to use the
            // name as a value reference for AG Grid so the cell can be editable in it's more
            // user-friendly form.
            props.setValue(m.name);
          }
        }}
      />
    </Cell>
  );
};

export default PaymentMethodCell;
