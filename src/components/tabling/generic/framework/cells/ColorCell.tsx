import { Color } from "components/tagging";
import { Cell } from "./generic";

export type ColorCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> = Table.CellProps<R, M, G, S, string | null>;

/* eslint-disable indent */
const ColorCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  value,
  ...props
}: ColorCellProps<R, M, G, S>): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={value} />
    </Cell>
  );
};

export default ColorCell;
