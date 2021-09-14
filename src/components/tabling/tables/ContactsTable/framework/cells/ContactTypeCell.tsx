import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const ContactTypeCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.ContactRowData,
    Model.Contact,
    Model.Group,
    Tables.ContactTableStore,
    Model.ContactType
  >
): JSX.Element => <ModelTagCell {...props} leftAlign={true} />;
export default ContactTypeCell;
