import React from "react";

import { isNil } from "lodash";

import { Tag } from "components/tagging";

import Cell from "./Cell";

export interface ModelTagCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel,
  CL extends Table.BodyColumn<R, M> = Table.BodyColumn<R, M>,
> extends Table.CellProps<R, M, C, S, V | null, CL> {
  readonly tagProps?: Omit<TagProps<V>, "model" | "text" | "children">;
}

const ModelTagCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel,
  CL extends Table.BodyColumn<R, M> = Table.BodyColumn<R, M>,
>({
  value,
  tagProps,
  ...props
}: ModelTagCellProps<R, M, C, S, V, CL>): JSX.Element => (
  <Cell<R, M, C, S, V, CL> {...props}>
    {!isNil(value) ? <Tag<V> model={value} {...tagProps} /> : <></>}
  </Cell>
);

export default React.memo(ModelTagCell) as typeof ModelTagCell;
