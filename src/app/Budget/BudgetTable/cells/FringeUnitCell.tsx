import { ICellRendererParams, RowNode } from "ag-grid-community";

import { FringeUnitModelsList } from "lib/model";
import { OptionModelTagsDropdown } from "components/control/dropdowns";

interface FringeUnitCellProps extends ICellRendererParams {
  onChange: (id: FringeUnit, row: Table.FringeRow) => void;
  value: FringeUnit | null;
  node: RowNode;
}

const FringeUnitCell = ({ value, node, onChange }: FringeUnitCellProps): JSX.Element => {
  return (
    <OptionModelTagsDropdown<FringeUnit, FringeUnitName, FringeUnitOptionModel>
      overlayClassName={"cell-dropdown"}
      value={value}
      models={FringeUnitModelsList}
      onChange={(unit: FringeUnit) => onChange(unit, node.data)}
    />
  );
};

export default FringeUnitCell;
