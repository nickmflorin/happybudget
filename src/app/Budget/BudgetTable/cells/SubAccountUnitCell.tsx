import { useMemo } from "react";
import { isNil } from "lodash";
import { SubAccountUnits } from "lib/model";
import { findChoiceForId, findChoiceForName } from "lib/model/util";
import { ChoiceTagsDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface SubAccountUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: Model.SubAccountUnitName | null;
}

const SubAccountUnitCell = ({ ...props }: SubAccountUnitCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceForName(SubAccountUnits, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceTagsDropdown<Model.SubAccountUnit, Model.SubAccountUnitId, Model.SubAccountUnitName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={SubAccountUnits}
        onChange={(unit: Model.SubAccountUnitId) => {
          const m = findChoiceForId(SubAccountUnits, unit);
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

export default SubAccountUnitCell;
