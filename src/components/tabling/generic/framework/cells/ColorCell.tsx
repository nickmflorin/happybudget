import { Color } from "components/tagging";
import { Cell } from "./generic";

export type ColorCellProps<R extends Table.Row, M extends Model.Model> = Table.CellProps<R, M, string | null>;

const ColorCell = <R extends Table.Row, M extends Model.Model>({
  value,
  ...props
}: ColorCellProps<R, M>): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={value} />
    </Cell>
  );
};

export default ColorCell;
