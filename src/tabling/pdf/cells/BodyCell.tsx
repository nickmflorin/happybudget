import { useMemo } from "react";
import { isNil } from "lodash";

import Cell, { PrivateCellProps, RowExplicitCellProps, CellProps } from "./Cell";

type ValueGetter<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> = (c: C, rows: Table.BodyRow<R>[]) => Table.InferColumnValue<C>;

export interface RowExplicitBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> extends RowExplicitCellProps<R, M, C> {
  readonly valueGetter?: ValueGetter<R, M, C>;
}

export interface BodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> extends RowExplicitBodyCellProps<R, M, C>,
    CellProps<R, M, C> {}

interface PrivateBodyCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
> extends Omit<PrivateCellProps<R, M, C>, "value" | "rawValue">,
    BodyCellProps<R, M, C> {
  readonly data: Table.BodyRow<R>[];
  readonly row?: RW;
  readonly firstChild: boolean;
  readonly lastChild: boolean;
}

const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  data,
  ...props
}: PrivateBodyCellProps<R, M, C, RW>): JSX.Element => {
  const rawValue: Table.InferColumnValue<C> = useMemo((): Table.InferColumnValue<C> => {
    if (!isNil(props.valueGetter)) {
      const valueFromValueGetter = props.valueGetter(props.column, data);
      if (valueFromValueGetter !== undefined) {
        return valueFromValueGetter;
      }
    } else if (!isNil(props.row)) {
      if (!isNil(props.column.pdfValueGetter)) {
        return props.column.pdfValueGetter(props.row, data);
      } else if (!isNil(props.column.field)) {
        const value = props.row.data[props.column.field] as Table.InferColumnValue<C>;
        if (value === null) {
          return null as Table.InferColumnValue<C>;
        } else if (typeof value !== "string" && typeof value !== "number") {
          /* If there is a custom cell renderer, the value can be anything since
             it will not be directly rendered in the DOM. */
          if (isNil(props.column.cellRenderer)) {
            return null as Table.InferColumnValue<C>;
          }
          return value;
        }
        return value;
      }
    }
    return null as Table.InferColumnValue<C>;
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
    <Cell<R, M, C>
      {...props}
      value={value}
      rawValue={rawValue}
      className={className}
      textClassName={["td-text", props.textClassName]}
    />
  );
};

export default BodyCell;
