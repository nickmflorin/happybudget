import React from "react";
import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell from "./Cell";

export interface ModelTagCellProps<R extends Table.Row, M extends Model.Model, V extends Model.Model>
  extends Table.CellProps<R, M, V | null> {
  readonly leftAlign?: boolean;
  readonly tagProps?: Omit<TagProps<V>, "model" | "text" | "children">;
}

const ModelTagCell = <R extends Table.Row, M extends Model.Model, V extends Model.Model>({
  value,
  leftAlign,
  tagProps,
  ...props
}: ModelTagCellProps<R, M, V>): JSX.Element => {
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={value === null}>
      <div style={{ display: "flex", justifyContent: leftAlign === true ? "left" : "center" }}>
        {!isNil(value) ? <Tag<V, any> model={value} {...tagProps} /> : <></>}
      </div>
    </Cell>
  );
};

export default React.memo(ModelTagCell) as typeof ModelTagCell;
