import React from "react";

import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const ContactTypeCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.ContactRowData,
    Model.Contact,
    Table.Context,
    Tables.ContactTableStore,
    Model.ContactType
  >,
): JSX.Element => <ModelTagCell {...props} />;
export default React.memo(ContactTypeCell);
