import React from "react";

import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

const ActualTypeCell = (
  props: framework.cells.ModelTagCellProps<Tables.ActualRowData, Model.Actual, Tables.ActualTableStore, Model.Tag>
): JSX.Element => {
  return <ModelTagCell {...props} />;
};

export default React.memo(ActualTypeCell);
