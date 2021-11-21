import React from "react";

import { Color } from "components/tagging";
import { Cell } from "./generic";

export type ColorCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = Table.CellProps<R, M, S, string | null>;

/* eslint-disable indent */
const ColorCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: ColorCellProps<R, M, S>): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={value} />
    </Cell>
  );
};

export default React.memo(ColorCell);
