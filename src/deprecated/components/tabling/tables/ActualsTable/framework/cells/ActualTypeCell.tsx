import React from "react";

import { framework } from "deprecated/components/tabling/generic";
import { ModelTagCell } from "deprecated/components/tabling/generic/framework/cells";

const ActualTypeCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.ActualRowData,
    Model.Actual,
    ActualsTableContext,
    Tables.ActualTableStore,
    Model.Tag
  >,
): JSX.Element => <ModelTagCell {...props} />;

export default React.memo(ActualTypeCell);
