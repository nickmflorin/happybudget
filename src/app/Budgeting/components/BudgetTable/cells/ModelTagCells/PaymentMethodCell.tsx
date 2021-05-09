import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const PaymentMethodCell = (props: ModelTagCellProps<Model.PaymentMethod, Table.ActualRow>): JSX.Element => (
  <ModelTagCell {...props} />
);
export default PaymentMethodCell;
