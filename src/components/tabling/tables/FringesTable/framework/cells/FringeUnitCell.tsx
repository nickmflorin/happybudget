import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const FringeUnitCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    Model.FringeUnit
  >
): JSX.Element => <ModelTagCell {...props} />;
export default FringeUnitCell;
