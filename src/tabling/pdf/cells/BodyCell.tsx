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
      if (props.column.isApplicableForRowType?.(props.row.rowType) === false || props.hideContent == true) {
        /* We do not want to return a nullValue because we want the cell contents
           to be empty. */
        return "" as V;
      }
      return tabling.columns.getColumnRowValue(props.column, props.row, data, "pdf");
    }
    return props.column.nullValue;
  }, [props.row, props.column]);

  const value = useMemo(() => {
    if (isNil(props.column.pdfFormatter)) {
      return typeof rawValue === "string" || typeof rawValue === "number" ? String(rawValue) : "";
    }
    return typeof rawValue === "string" || typeof rawValue === "number" ? props.column.pdfFormatter(rawValue) : "";
  }, [rawValue, props.column]);

  return (
    <Cell<R, M, V> {...props} value={value} rawValue={rawValue} textClassName={["td-text", props.textClassName]} />
  );
};

export default BodyCell;
