import React from "react";

import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

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
