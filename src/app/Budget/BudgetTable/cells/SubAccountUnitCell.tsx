import { useMemo } from "react";
import { isNil } from "lodash";
import { SubAccountUnits } from "lib/model";
import { findChoiceModelForId, findChoiceModelForName } from "lib/model/util";
import { ChoiceModelTagsDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";

interface SubAccountUnitCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: SubAccountUnitName | null;
}

const SubAccountUnitCell = ({ ...props }: SubAccountUnitCellProps): JSX.Element => {
  const model = useMemo(() => {
    if (!isNil(props.value)) {
      return findChoiceModelForName(SubAccountUnits, props.value);
    }
    return null;
  }, [props.value]);
  return (
    <Cell {...props}>
      <ChoiceModelTagsDropdown<SubAccountUnit, SubAccountUnitId, SubAccountUnitName>
        overlayClassName={"cell-dropdown"}
        value={!isNil(model) ? model.id : null}
        models={SubAccountUnits}
        onChange={(unit: SubAccountUnitId) => {
          const m = findChoiceModelForId(SubAccountUnits, unit);
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

export default SubAccountUnitCell;
