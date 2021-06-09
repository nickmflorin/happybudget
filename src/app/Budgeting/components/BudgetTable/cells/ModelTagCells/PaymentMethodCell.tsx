import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const PaymentMethodCell = (props: ModelTagCellProps<Model.PaymentMethod, BudgetTable.ActualRow>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default PaymentMethodCell;
