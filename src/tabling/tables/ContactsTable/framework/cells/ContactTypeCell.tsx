import React from "react";

import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

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
