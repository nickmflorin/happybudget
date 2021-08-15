import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const ContactTypeCell = (
  props: framework.cells.ModelTagCellProps<Tables.ContactRow, Model.Contact, Model.ContactType>
): JSX.Element => <ModelTagCell {...props} leftAlign={true} />;
export default ContactTypeCell;
