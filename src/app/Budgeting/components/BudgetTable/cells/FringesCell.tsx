import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "./Cell";

export interface FringesCellProps extends StandardCellProps {
  children: Model.Fringe[];
  onAddFringes: () => void;
}

const FringesCell = ({ children, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue([])} hideClear={children.length === 0}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Tag.Multiple<Model.Fringe> models={children} />
      </div>
    </Cell>
  );
};

export default FringesCell;
