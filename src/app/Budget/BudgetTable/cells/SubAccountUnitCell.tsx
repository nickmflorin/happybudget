import { SubAccountUnitModelsList } from "lib/model";
import { OptionModelTagsDropdown } from "components/control/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface SubAccountUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: SubAccountUnit | null;
}

const SubAccountUnitCell = ({ ...props }: SubAccountUnitCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <OptionModelTagsDropdown<SubAccountUnit, SubAccountUnitName, SubAccountUnitOptionModel>
        overlayClassName={"cell-dropdown"}
        value={props.value}
        models={SubAccountUnitModelsList}
        onChange={(unit: SubAccountUnit) => props.setValue(unit)}
      />
    </Cell>
  );
};

export default SubAccountUnitCell;
