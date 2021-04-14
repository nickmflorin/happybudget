import { useMemo } from "react";
import { isNil } from "lodash";
import { FringeUnits } from "lib/model";
import { findChoiceForId, findChoiceForName } from "lib/model/util";
import { ChoiceTagsDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface FringeUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: Model.FringeUnitName | null;
}

const FringeUnitCell = ({ ...props }: FringeUnitCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceForName(FringeUnits, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceTagsDropdown<Model.FringeUnit, Model.FringeUnitId, Model.FringeUnitName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={FringeUnits}
        onChange={(unit: Model.FringeUnitId) => {
          const m = findChoiceForId(FringeUnits, unit);
          if (!isNil(m)) {
            // We need to use the ID as an internal reference to the model for the
            // Model.ChoiceTagsDropdown component (via the `value` prop) but we need to use the
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
