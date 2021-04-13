import { useMemo } from "react";
import { isNil } from "lodash";
import { ChoiceModelTagsDropdown } from "components/dropdowns";
import { PaymentMethods } from "lib/model";
import { findChoiceModelForId, findChoiceModelForName } from "lib/model/util";
import Cell, { StandardCellProps } from "./Cell";

interface PaymentMethodCellProps extends StandardCellProps<Table.ActualRow> {
  value: PaymentMethodName | null;
}

const PaymentMethodCell = ({ ...props }: PaymentMethodCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceModelForName(PaymentMethods, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceModelTagsDropdown<PaymentMethod, PaymentMethodId, PaymentMethodName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={PaymentMethods}
        onChange={(unit: PaymentMethodId) => {
          const m = findChoiceModelForId(PaymentMethods, unit);
          if (!isNil(m)) {
            // We need to use the ID as an internal reference to the model for the
            // ChoiceModelTagsDropdown component (via the `value` prop) but we need to use the
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
