import { ICellRendererParams, RowNode } from "ag-grid-community";

import { UnitDropdown } from "components/control/dropdowns";

interface SubAccountUnitCellProps extends ICellRendererParams {
  onChange: (id: SubAccountUnit, row: Table.SubAccountRow) => void;
  value: SubAccountUnit | null;
  node: RowNode;
}

const SubAccountUnitCell = ({ value, node, onChange }: SubAccountUnitCellProps): JSX.Element => {
  return <UnitDropdown value={value} onChange={(unit: SubAccountUnit) => onChange(unit, node.data)} />;
};

export default SubAccountUnitCell;
