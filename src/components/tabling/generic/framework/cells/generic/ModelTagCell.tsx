import React from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell from "./Cell";

export interface ModelTagCellProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
  V extends Model.Model = Model.Model
> extends Table.CellProps<R, M, G, S, V | null> {
  readonly leftAlign?: boolean;
  readonly tagProps?: Omit<TagProps<V>, "model" | "text" | "children">;
}

/* eslint-disable indent */
const ModelTagCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
  V extends Model.Model = Model.Model
>({
  value,
  leftAlign,
  tagProps,
  ...props
}: ModelTagCellProps<R, M, G, S, V>): JSX.Element => {
  return (
    <Cell {...props}>
      <div style={{ display: "flex", justifyContent: leftAlign === true ? "left" : "center" }}>
        {!isNil(value) ? <Tag<V, any> model={value} {...tagProps} /> : <></>}
      </div>
    </Cell>
  );
};

export default React.memo(ModelTagCell) as typeof ModelTagCell;
