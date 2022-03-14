/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const isBodyColumn = <R extends Table.RowData, M extends Model.RowHttpModel, V extends Table.RawRowValue = any>(
  c: Table.Column<R, M, V>
): c is Table.BodyColumn<R, M, V> => (c as Table.BodyColumn<R, M, V>).cType === "body";

export const isCalculatedColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.CalculatedColumn<R, M> => (c as Table.CalculatedColumn<R, M>).cType === "calculated";

export const isActionColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.ActionColumn<R, M> => (c as Table.ActionColumn<R, M>).cType === "action";

export const isDataColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.DataColumn<R, M> => isBodyColumn(c) || isCalculatedColumn(c);

export const isFakeColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.FakeColumn<R, M> => (c as Table.FakeColumn<R, M>).cType === "fake";

export const isRealColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.RealColumn<R, M> => isDataColumn(c) || isActionColumn(c);

export const isModelColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  c: Table.Column<R, M>
): c is Table.ModelColumn<R, M> => isDataColumn(c) || isFakeColumn(c);
