import { ICellRendererParams, RowNode } from "ag-grid-community";

import { SubAccountUnitModelsList } from "lib/model";
import { OptionModelTagsDropdown } from "components/control/dropdowns";

interface SubAccountUnitCellProps extends ICellRendererParams {
  onChange: (id: SubAccountUnit, row: Table.SubAccountRow) => void;
  value: SubAccountUnit | null;
  node: RowNode;
}

const SubAccountUnitCell = ({ value, node, onChange }: SubAccountUnitCellProps): JSX.Element => {
  return (
    <OptionModelTagsDropdown<SubAccountUnit, SubAccountUnitName, SubAccountUnitOptionModel>
      overlayClassName={"cell-dropdown"}
      value={value}
      models={SubAccountUnitModelsList}
      onChange={(unit: SubAccountUnit) => onChange(unit, node.data)}
    />
  );
};

export default SubAccountUnitCell;
