import { useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import Cell, { CellProps } from "./Cell";

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  data,
  ...props
}: Omit<CellProps<R, M>, "value" | "rawValue"> & {
  readonly data: Table.BodyRow<R>[];
  readonly row: RW;
}): JSX.Element => {
  const rawValue: R[keyof R] | string | number | null = useMemo((): R[keyof R] | string | number | null => {
    if (!isNil(props.column.valueGetter)) {
      return props.column.valueGetter(props.row, data);
    } else if (!isNil(props.column.field)) {
      const value = props.row.data[props.column.field];
      if (value === null) {
        return null;
      } else if (typeof value !== "string" && typeof value !== "number") {
        // If there is a custom cell renderer, the value can be anything since it will not be
        // directly rendered in the DOM.
        if (isNil(props.column.cellRenderer)) {
          /* eslint-disable no-console */
          console.error(
            `Column ${tabling.columns.normalizedField(props.column)} did not return
          string or number type from data!
          Returning null...`
          );
          return null;
        }
        return value;
      }
      return value;
    }
    return null;
  }, [props.row, props.column]);

  const value = useMemo(() => {
    if (isNil(props.column.formatter)) {
      return typeof rawValue === "string" || typeof rawValue === "number" ? String(rawValue) : "";
    }
    return typeof rawValue === "string" || typeof rawValue === "number" ? props.column.formatter(rawValue) : "";
  }, [rawValue, props.column]);

  return (
    <Cell
      {...props}
      value={value}
      rawValue={rawValue}
      className={["td", props.className]}
      textClassName={["td-text", props.textClassName]}
    />
  );
};

export default BodyCell;
