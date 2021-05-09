import { map, find, filter } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "../Cell";

export interface FringesCellProps<R extends Table.Row> extends StandardCellProps<R> {
  value: number[];
  onAddFringes: () => void;
  fringes: Model.Fringe[];
}

const FringesCell = <R extends Table.Row>({
  fringes,
  value,
  onAddFringes,
  ...props
}: FringesCellProps<R>): JSX.Element => {
  return (
    <Cell {...props} onClear={() => props.setValue([])} hideClear={value.length === 0}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Tag.Multiple<Model.Fringe>
          models={
            filter(
              map(value, (id: number) => find(fringes, { id } as any)),
              (fringe: Model.Fringe | undefined) => fringe !== undefined
            ) as Model.Fringe[]
          }
        />
      </div>
    </Cell>
  );
};

export default FringesCell;
