import React from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell from "./Cell";

export interface ModelTagCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel,
  C extends Table.BodyColumn<R, M> = Table.BodyColumn<R, M>
> extends Table.CellProps<R, M, S, V | null, C> {
  readonly tagProps?: Omit<TagProps<V>, "model" | "text" | "children">;
}

const ModelTagCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends Model.HttpModel = Model.HttpModel,
  C extends Table.BodyColumn<R, M> = Table.BodyColumn<R, M>
>({
  value,
  tagProps,
  ...props
}: ModelTagCellProps<R, M, S, V, C>): JSX.Element => {
  return <Cell<R, M, S, V, C> {...props}>{!isNil(value) ? <Tag<V> model={value} {...tagProps} /> : <></>}</Cell>;
};

export default React.memo(ModelTagCell) as typeof ModelTagCell;
