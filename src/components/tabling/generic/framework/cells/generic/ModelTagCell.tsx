import React from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell from "./Cell";

export interface ModelTagCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel
> extends Table.CellProps<R, M, S, V | null> {
  readonly tagProps?: Omit<TagProps<V>, "model" | "text" | "children">;
}

/* eslint-disable indent */
const ModelTagCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel
>({
  value,
  tagProps,
  ...props
}: ModelTagCellProps<R, M, S, V>): JSX.Element => {
  return <Cell {...props}>{!isNil(value) ? <Tag<V, any> model={value} {...tagProps} /> : <></>}</Cell>;
};

export default React.memo(ModelTagCell) as typeof ModelTagCell;
