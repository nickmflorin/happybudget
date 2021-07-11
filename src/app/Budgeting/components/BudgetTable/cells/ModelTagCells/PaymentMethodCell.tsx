import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const PaymentMethodCell = (props: ModelTagCellProps<Model.PaymentMethod>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default PaymentMethodCell;
