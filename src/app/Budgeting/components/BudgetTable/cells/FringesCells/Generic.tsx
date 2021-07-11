import { map, find, filter, isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "../Cell";

export interface FringesCellProps extends StandardCellProps {
  children: number[];
  onAddFringes: () => void;
  fringes: Model.Fringe[];
}

const FringesCell = ({ fringes, children, onAddFringes, ...props }: FringesCellProps): JSX.Element => {
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue([])} hideClear={children.length === 0}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        <Tag.Multiple<Model.Fringe>
          models={
            filter(
              map(children, (id: number) => find(fringes, { id } as any)),
              (fringe: Model.Fringe | undefined) => fringe !== undefined
            ) as Model.Fringe[]
          }
        />
      </div>
    </Cell>
  );
};

export default FringesCell;
