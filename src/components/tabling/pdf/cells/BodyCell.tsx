import { useMemo } from "react";
import { isNil } from "lodash";

import Cell, { PrivateCellProps, RowExplicitCellProps, CellProps } from "./Cell";

type ValueGetter<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = R[keyof R]> = (
  c: Table.PdfColumn<R, M, V>,
  rows: Table.BodyRow<R>[]
) => V | null | undefined;

export interface RowExplicitBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V = R[keyof R]
> extends RowExplicitCellProps<R, M, V> {
  readonly valueGetter?: ValueGetter<R, M, V>;
}

export interface BodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V = R[keyof R]
> extends RowExplicitBodyCellProps<R, M, V>,
    CellProps<R, M, V> {}

interface PrivateBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
  V = R[keyof R]
> extends Omit<PrivateCellProps<R, M, V>, "value" | "rawValue">,
    BodyCellProps<R, M, V> {
  readonly data: Table.BodyRow<R>[];
  readonly row?: RW;
  readonly firstChild: boolean;
  readonly lastChild: boolean;
}

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
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
      if (!isNil(props.column.pdfValueGetter)) {
        return props.column.pdfValueGetter(props.row, data);
      } else if (!isNil(props.column.field)) {
        const value = props.row.data[props.column.field];
        if (value === null) {
          return null;
        } else if (typeof value !== "string" && typeof value !== "number") {
          /* If there is a custom cell renderer, the value can be anything since
             it will not be directly rendered in the DOM. */
          if (isNil(props.column.cellRenderer)) {
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
    if (isNil(props.column.pdfFormatter)) {
      return typeof rawValue === "string" || typeof rawValue === "number" ? String(rawValue) : "";
    }
    return typeof rawValue === "string" || typeof rawValue === "number" ? props.column.pdfFormatter(rawValue) : "";
  }, [rawValue, props.column]);

  const className = useMemo(() => {
    let cs = ["td", props.className];
    if (props.firstChild) {
      cs = [...cs, "td-first-child"];
    }
    if (props.lastChild) {
      cs = [...cs, "td-last-child"];
    }
    return cs;
  }, [props.className, props.firstChild]);

  return (
    <Cell
      {...props}
      value={value}
      rawValue={rawValue}
      className={className}
      textClassName={["td-text", props.textClassName]}
    />
  );
};

export default BodyCell;
