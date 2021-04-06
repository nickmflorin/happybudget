import { FringeUnitModelsList } from "lib/model";
import { OptionModelTagsDropdown } from "components/control/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface FringeUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: FringeUnit | null;
}

const FringeUnitCell = ({ ...props }: FringeUnitCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <OptionModelTagsDropdown<FringeUnit, FringeUnitName, FringeUnitOptionModel>
        overlayClassName={"cell-dropdown"}
        value={props.value}
        models={FringeUnitModelsList}
        onChange={(unit: FringeUnit) => props.setValue(unit)}
      />
    </Cell>
  );
};

export default FringeUnitCell;
