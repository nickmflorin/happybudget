import React from "react";

import { framework } from "tabling/generic";
import { ModelTagCell } from "tabling/generic/framework/cells";

const FringeUnitCell = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
  PUBLIC extends boolean
>(
  props: framework.cells.ModelTagCellProps<
    Tables.FringeRowData,
    Model.Fringe,
    FringesTableContext<B, P, PUBLIC>,
    Tables.FringeTableStore,
    Model.FringeUnit
  >
): JSX.Element => <ModelTagCell {...props} />;
export default React.memo(FringeUnitCell);
