import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const FringeUnitCell = (
  props: framework.cells.ModelTagCellProps<
    Tables.FringeRowData,
    Model.Fringe,
    Model.Group,
    Tables.FringeTableStore,
    Model.FringeUnit
  >
): JSX.Element => <ModelTagCell {...props} leftAlign={true} />;
export default FringeUnitCell;
