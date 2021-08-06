import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const PaymentMethodCell = (
  props: framework.cells.ModelTagCellProps<Tables.ActualRow, Model.Actual, Model.PaymentMethod>
): JSX.Element => <ModelTagCell {...props} leftAlign={true} />;
export default PaymentMethodCell;
