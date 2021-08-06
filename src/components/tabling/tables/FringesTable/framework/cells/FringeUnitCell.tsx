import { framework } from "components/tabling/generic";
import { ModelTagCell } from "components/tabling/generic/framework/cells";

const FringeUnitCell = (
  props: framework.cells.ModelTagCellProps<Tables.FringeRow, Model.Fringe, Model.FringeUnit>
): JSX.Element => <ModelTagCell {...props} leftAlign={true} />;
export default FringeUnitCell;
