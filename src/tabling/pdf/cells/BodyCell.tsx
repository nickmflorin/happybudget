import { useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import Cell, { PrivateCellProps, RowExplicitCellProps, CellProps } from "./Cell";

export interface RowExplicitBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> extends RowExplicitCellProps<R, M, V> {
  readonly valueGetter?: (c: Table.DataColumn<R, M, V>, rows: Table.BodyRow<R>[]) => V;
}

export interface BodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> extends RowExplicitBodyCellProps<R, M, V>,
    CellProps<R, M, V> {}

interface PrivateBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
> extends Omit<PrivateCellProps<R, M, V>, "value" | "rawValue">,
    BodyCellProps<R, M, V> {
  readonly data: Table.BodyRow<R>[];
  readonly row?: RW;
  readonly firstChild: boolean;
  readonly lastChild: boolean;
}

const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  data,
  ...props
}: PrivateBodyCellProps<R, M, V, RW>): JSX.Element => {
  const rawValue: V = useMemo((): V => {
    if (!isNil(props.valueGetter)) {
      const valueFromValueGetter = props.valueGetter(props.column, data);
      if (valueFromValueGetter !== undefined) {
        return valueFromValueGetter;
      }
    } else if (!isNil(props.row)) {
      if (!isNil(props.column.pdfValueGetter)) {
        return props.column.pdfValueGetter(props.row, data) as V;
      } else if (!isNil(props.column.field)) {
        let value: V | undefined = undefined;
        if (tabling.typeguards.isMarkupRow(props.row) && !isNil(props.column.markupField)) {
          value = props.row.data[props.column.markupField] as unknown as V | undefined;
        } else if (tabling.typeguards.isGroupRow(props.row) && !isNil(props.column.groupField)) {
          value = props.row.data[props.column.groupField] as unknown as V | undefined;
        } else if (tabling.typeguards.isModelRow(props.row)) {
          value = props.row.data[props.column.field] as V | undefined;
        }
        if (value === undefined) {
          console.error(
            `Unexpectedly encountered undefined value for row ${props.row.id}, column ${props.column.field}.`
          );
          return null as V;
        } else if (value === null) {
          return null as V;
        } else if (typeof value !== "string" && typeof value !== "number") {
          /* If there is a custom cell renderer, the value can be anything since
             it will not be directly rendered in the DOM. */
          if (isNil(props.column.cellRenderer)) {
            return null as V;
          }
          return value;
        }
        return value;
      }
    }
    return null as V;
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
    <Cell<R, M, V>
      {...props}
      value={value}
      rawValue={rawValue}
      className={className}
      textClassName={["td-text", props.textClassName]}
    />
  );
};

export default BodyCell;
