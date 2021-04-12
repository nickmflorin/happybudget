import { getKeyValue } from "lib/util";

export const isRowChangeData = <R extends Table.Row, M extends Model>(
  obj: Table.RowChange<R> | Table.RowChangeData<R> | R | M
): obj is Table.RowChangeData<R> => {
  let hasValues = true;
  for (const key in obj) {
    if (
      !Object.prototype.hasOwnProperty.call(getKeyValue<any, any>(key)(obj), "newValue") ||
      !Object.prototype.hasOwnProperty.call(getKeyValue<any, any>(key)(obj), "oldValue")
    ) {
      hasValues = false;
      break;
    }
  }
  return hasValues;
};

export const isRowChange = <R extends Table.Row, M extends Model>(
  obj: Table.RowChange<R> | Table.RowChangeData<R> | R | M
): obj is Table.RowChange<R> => {
  const data = (obj as Table.RowChange<R>).data;
  if (typeof data === "object" && data !== undefined) {
    return isRowChangeData(data);
  }
  return false;
};

export const isRow = <R extends Table.Row, M extends Model>(obj: R | M): obj is R => {
  return (obj as R).meta !== undefined;
};

export const isModel = <R extends Table.Row, M extends Model>(
  obj: Table.RowChange<R> | Table.RowChangeData<R> | R | M
): obj is M => {
  return !isRowChangeData<R, M>(obj) && !isRowChange<R, M>(obj) && !isRow<R, M>(obj);
};
