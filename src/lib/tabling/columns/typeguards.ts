import * as model from "../../model";
import * as rows from "../rows";

import * as types from "./types";

export const isBodyColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.BodyColumn<R, M> => (c as types.BodyColumn<R, M>).cType === "body";

export const isCalculatedColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.CalculatedColumn<R, M> => (c as types.CalculatedColumn<R, M>).cType === "calculated";

export const isActionColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.ActionColumn<R, M> => (c as types.ActionColumn<R, M>).cType === "action";

export const isDataColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.DataColumn<R, M> => isBodyColumn(c) || isCalculatedColumn(c);

export const isFakeColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.FakeColumn<R, M> => (c as types.FakeColumn<R, M>).cType === "fake";

export const isRealColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.RealColumn<R, M> => isDataColumn(c) || isActionColumn(c);

export const isModelColumn = <R extends rows.Row, M extends model.RowTypedApiModel>(
  c: types.Column<R, M>,
): c is types.ModelColumn<R, M> => isDataColumn(c) || isFakeColumn(c);
