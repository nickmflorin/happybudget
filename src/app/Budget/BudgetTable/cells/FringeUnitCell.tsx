import { useMemo } from "react";
import { isNil } from "lodash";
import { FringeUnits } from "lib/model";
import { findChoiceModelForId, findChoiceModelForName } from "lib/model/util";
import { ChoiceModelTagsDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface FringeUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: FringeUnitName | null;
}

const FringeUnitCell = ({ ...props }: FringeUnitCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceModelForName(FringeUnits, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceModelTagsDropdown<FringeUnit, FringeUnitId, FringeUnitName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={FringeUnits}
        onChange={(unit: FringeUnitId) => {
          const m = findChoiceModelForId(FringeUnits, unit);
          if (!isNil(m)) {
            // We need to use the ID as an internal reference to the model for the
            // ChoiceModelTagsDropdown component (via the `value` prop) but we need to use the
            // name as a value reference for AG Grid so the cell can be editable in it's more
            // user-friendly form.
            props.setValue(m.name);
          }
        }}
      />
    </Cell>
  );
};

export default FringeUnitCell;
