import React from "react";

import { framework } from "deprecated/components/tabling/generic";
import { ModelTagCell } from "deprecated/components/tabling/generic/framework/cells";

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
