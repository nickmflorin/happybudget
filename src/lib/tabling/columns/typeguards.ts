import * as model from "../../model";
import * as rows from "../rows";
import { CellValue } from "../types";

import * as types from "./types";

export const isBodyColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.BodyColumn<R, M, N, T> => isColumnOfType(c, "body");

export const isCalculatedColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.CalculatedColumn<R, M, N, T> => isColumnOfType(c, "calculated");

export const isActionColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.ActionColumn<R, M, N, T> => isColumnOfType(c, "action");

export const isDataColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.DataColumn<R, M, N, T> => isBodyColumn(c) || isCalculatedColumn(c);

export const isFakeColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.FakeColumn<R, M, N, T> => (c as types.FakeColumn<R, M, N, T>).cType === "fake";

export const isRealColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.RealColumn<R, M, N, T> => isDataColumn(c) || isActionColumn(c);

export const isModelColumn = <
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
): c is types.ModelColumn<R, M, N, T> => isDataColumn(c) || isFakeColumn(c);

export const isColumnOfType = <
  I extends types.ColumnTypeId,
  R extends rows.Row,
  M extends model.RowTypedApiModel,
  N extends types.ColumnFieldName<R> = types.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  c: types.Column<R, M, N, T>,
  type: I,
): c is types.ColumnOfType<I, R, M, N, T> => c.cType === type;
