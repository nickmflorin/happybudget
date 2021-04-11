import { OptionModelTagsDropdown } from "components/dropdowns";
import { PaymentMethodModelsList } from "lib/model";
import Cell, { StandardCellProps } from "./Cell";

interface PaymentMethodCellProps extends StandardCellProps<Table.ActualRow> {
  value: PaymentMethod | null;
}

const PaymentMethodCell = ({ ...props }: PaymentMethodCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <OptionModelTagsDropdown<PaymentMethod, PaymentMethodName, PaymentMethodOptionModel>
        overlayClassName={"cell-dropdown"}
        value={props.value}
        models={PaymentMethodModelsList}
        onChange={(paymentMethod: PaymentMethod) => props.setValue(paymentMethod)}
      />
    </Cell>
  );
};

export default PaymentMethodCell;
