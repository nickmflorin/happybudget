import React from "react";

import { Color } from "components/tagging";

import { Cell } from "./generic";

export type ColorCellProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  CL extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>,
> = Table.CellProps<R, M, C, S, string | null, CL>;

const ColorCell = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  CL extends Table.DataColumn<R, M, string | null> = Table.DataColumn<R, M, string | null>,
>({
  value,
  ...props
}: ColorCellProps<R, M, C, S, CL>): JSX.Element => (
  /*
	If the value is null (i.e. no color is selected for the row) then we want
	to show the default color.  However, when selecting the default color in
	the editor, the color will not be treated as the default but will instead
	be treated as null, because that color may not exist in the BE.
	*/
  <Cell {...props}>
    <Color color={value} size={20} useDefault={true} />
  </Cell>
);
export default React.memo(ColorCell);
