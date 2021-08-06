import { isNil } from "lodash";
import { Tag } from "components/tagging";
import { Cell } from "components/tabling/generic/framework/cells";

export interface FringesCellProps
  extends BudgetTable.CellProps<Tables.SubAccountRow, Model.SubAccount, Model.Fringe[]> {
  readonly onAddFringes: () => void;
}

const FringesCell = ({ value, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  // I don't understand why, but sometimes (particularly after a hot reload) the children
  // prop seems to be coming in as undefined.  So we need to validate that it is not undefined
  // in the below cases.
  return (
    <Cell
      {...props}
      onClear={() => !isNil(props.setValue) && props.setValue([])}
      hideClear={isNil(value) || value.length === 0}
    >
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Tag.Multiple<Model.Fringe> models={value} />
      </div>
    </Cell>
  );
};

export default FringesCell;
