import { ICellRendererParams, RowNode } from "ag-grid-community";

import { PaymentMethodsDropdown } from "components/control/dropdowns";

interface PaymentMethodCellProps extends ICellRendererParams {
  onChange: (id: PaymentMethod, row: Table.ActualRow) => void;
  value: PaymentMethod | null;
  node: RowNode;
}

const PaymentMethodCell = ({ value, node, onChange }: PaymentMethodCellProps): JSX.Element => {
  return (
    <PaymentMethodsDropdown
      value={value}
      onChange={(paymentMethod: PaymentMethod) => onChange(paymentMethod, node.data)}
    />
  );
};

export default PaymentMethodCell;
