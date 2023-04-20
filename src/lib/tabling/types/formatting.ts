import { ValueFormatterParams } from "ag-grid-community";

import * as columns from "../columns";
import * as rows from "../rows";

import * as cells from "./cells";

export type TableValueFormatterParams<
  R extends rows.Row = rows.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends cells.CellValue<R, N> = cells.CellValue<R, N>,
> = ValueFormatterParams<R, T>;

export type TableValueFormatter<
  R extends rows.Row = rows.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends cells.CellValue<R, N> = cells.CellValue<R, N>,
> = (params: TableValueFormatterParams<R, N, T>) => string;
