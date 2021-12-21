import React from "react";

import { Color } from "components/tagging";
import { Cell } from "./generic";

export type ColorCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>
> = Table.CellProps<R, M, S, string | null, C>;

const ColorCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>
>({
  value,
  ...props
}: ColorCellProps<R, M, S, C>): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={value} />
    </Cell>
  );
};

export default React.memo(ColorCell);
