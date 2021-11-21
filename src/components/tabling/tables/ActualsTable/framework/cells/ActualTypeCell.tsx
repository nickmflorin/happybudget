import React from "react";

import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const ActualTypeCell = (
  props: framework.cells.ModelTagCellProps<Tables.ActualRowData, Model.Actual, Tables.ActualTableStore, Model.Tag>
): JSX.Element => {
  return <ModelTagCell {...props} />;
};

export default React.memo(ActualTypeCell);
