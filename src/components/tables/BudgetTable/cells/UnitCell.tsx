import { ICellRendererParams, RowNode } from "ag-grid-community";

import { UnitDropdown } from "components/control/dropdowns";

interface UnitCellProps extends ICellRendererParams {
  onChange: (id: Unit, row: Table.SubAccountRow) => void;
  value: Unit | null;
  node: RowNode;
}

const UnitCell = ({ value, node, onChange }: UnitCellProps): JSX.Element => {
  return <UnitDropdown value={value} onChange={(unit: Unit) => onChange(unit, node.data)} />;
};

export default UnitCell;
