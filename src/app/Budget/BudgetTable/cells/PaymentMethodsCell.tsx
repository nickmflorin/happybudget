import { isNil } from "lodash";
import { ChoiceModelTagsDropdown } from "components/dropdowns";
import { PaymentMethods } from "lib/model";
import { findChoiceModelForId } from "lib/model/util";
import Cell, { StandardCellProps } from "./Cell";

interface PaymentMethodCellProps extends StandardCellProps<Table.ActualRow> {
  value: PaymentMethod | null;
}

const PaymentMethodCell = ({ ...props }: PaymentMethodCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <ChoiceModelTagsDropdown<PaymentMethod, PaymentMethodId, PaymentMethodName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(props.value) ? props.value.id : null}
        models={PaymentMethods}
        onChange={(paymentMethod: PaymentMethodId) => {
          const model = findChoiceModelForId(PaymentMethods, paymentMethod);
          if (!isNil(model)) {
            props.setValue(model);
          }
        }}
      />
    </Cell>
  );
};

export default PaymentMethodCell;
