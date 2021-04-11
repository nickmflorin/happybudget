import { isNil } from "lodash";
import { FringeUnits } from "lib/model";
import { findChoiceModelForId } from "lib/model/util";
import { ChoiceModelTagsDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface FringeUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: FringeUnit | null;
}

const FringeUnitCell = ({ ...props }: FringeUnitCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <ChoiceModelTagsDropdown<FringeUnit, FringeUnitId, FringeUnitName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(props.value) ? props.value.id : null}
        models={FringeUnits}
        onChange={(unit: FringeUnitId) => {
          const model = findChoiceModelForId(FringeUnits, unit);
          if (!isNil(model)) {
            props.setValue(model);
          }
        }}
      />
    </Cell>
  );
};

export default FringeUnitCell;
