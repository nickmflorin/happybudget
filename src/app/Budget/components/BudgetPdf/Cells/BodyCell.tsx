import { useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import Cell, { PrivateCellProps, RowExplicitCellProps, CellProps } from "./Cell";

type ValueGetter<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]> = (
  c: Table.PdfColumn<R, M, V>,
  rows: Table.BodyRow<R>[]
) => V | null | undefined;

export interface RowExplicitBodyCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = R[keyof R]
> extends RowExplicitCellProps<R, M, V> {
  readonly valueGetter?: ValueGetter<R, M, V>;
}

export interface BodyCellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>
  extends RowExplicitBodyCellProps<R, M, V>,
    CellProps<R, M, V> {}

interface PrivateBodyCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
  V = R[keyof R]
> extends Omit<PrivateCellProps<R, M, V>, "value" | "rawValue">,
    BodyCellProps<R, M, V> {
  readonly data: Table.BodyRow<R>[];
  readonly row?: RW;
}

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
  V = R[keyof R]
>({
  data,
  ...props
}: PrivateBodyCellProps<R, M, RW, V>): JSX.Element => {
  const rawValue: V | null = useMemo((): V | null => {
    if (!isNil(props.valueGetter)) {
      const valueFromValueGetter = props.valueGetter(props.column, data);
      if (valueFromValueGetter !== undefined) {
        return valueFromValueGetter;
      }
    } else if (!isNil(props.row)) {
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
          return value as unknown as V;
        }
        return value as unknown as V;
      }
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
