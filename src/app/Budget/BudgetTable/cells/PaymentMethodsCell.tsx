import { ICellRendererParams, RowNode } from "ag-grid-community";

import { OptionModelTagsDropdown } from "components/control/dropdowns";
import { PaymentMethodModelsList } from "model";

interface PaymentMethodCellProps extends ICellRendererParams {
  onChange: (id: PaymentMethod, row: Table.ActualRow) => void;
  value: PaymentMethod | null;
  node: RowNode;
}

const PaymentMethodCell = ({ value, node, onChange }: PaymentMethodCellProps): JSX.Element => {
  return (
    <OptionModelTagsDropdown<PaymentMethod, PaymentMethodName, PaymentMethodOptionModel>
      value={value}
      models={PaymentMethodModelsList}
      onChange={(paymentMethod: PaymentMethod) => onChange(paymentMethod, node.data)}
    />
  );
};

export default PaymentMethodCell;
