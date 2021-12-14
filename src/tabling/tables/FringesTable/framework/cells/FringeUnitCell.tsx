import React from "react";

import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

const FringeUnitCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Model.FringeUnit
  >
): JSX.Element => <ModelTagCell {...props} />;
export default React.memo(FringeUnitCell);
