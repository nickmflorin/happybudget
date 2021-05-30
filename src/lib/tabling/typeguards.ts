import { getKeyValue } from "lib/util";

export const isRowChangeData = <R extends Table.Row, M extends Model.Model>(
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

export const isRowChange = <R extends Table.Row, M extends Model.Model>(
  obj: Table.RowChange<R> | Table.RowChangeData<R> | R | M
): obj is Table.RowChange<R> => {
  const data = (obj as Table.RowChange<R>).data;
  if (typeof data === "object" && data !== undefined) {
    return isRowChangeData(data);
  }
  return false;
};

export const isRow = <R extends Table.Row, M extends Model.Model>(obj: R | M): obj is R => {
  return (obj as R).meta !== undefined;
};

export const isModel = <R extends Table.Row, M extends Model.Model>(
  obj: Table.RowChange<R> | Table.RowChangeData<R> | R | M
): obj is M => {
  return !isRowChangeData<R, M>(obj) && !isRowChange<R, M>(obj) && !isRow<R, M>(obj);
};

export const isSplitConfig = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config:
    | Omit<Table.IAgnosticReadWriteField<R, M, P>, "read" | "write">
    | Omit<Table.ISplitReadWriteField<R, M, P>, "read" | "write">
): config is Omit<Table.ISplitReadWriteField<R, M, P>, "read" | "write"> => {
  return (
    (config as Table.ISplitReadWriteField<R, M, P>).modelField !== undefined &&
    (config as Table.ISplitReadWriteField<R, M, P>).rowField !== undefined
  );
};

export const isReadField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Table.Field<R, M, P>
): field is
  | Table.IReadOnlyField<R, M>
  | Table.IAgnosticReadWriteField<R, M, P>
  | Table.ISplitReadWriteField<R, M, P> => {
  return (field as Table.IReadField).read === true;
};

export const isWriteField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Table.Field<R, M, P>
): field is
  | Table.IWriteOnlyField<R, M, P>
  | Table.IAgnosticReadWriteField<R, M, P>
  | Table.ISplitReadWriteField<R, M, P> => {
  return (field as Table.IWriteField<R, M, P>).write === true;
};

export const isSplitField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Table.Field<R, M, P>
): field is Table.ISplitReadWriteField<R, M, P> => {
  return (
    isReadField(field) &&
    isWriteField(field) &&
    (field as Table.ISplitReadWriteField<R, M, P>).modelField !== undefined &&
    (field as Table.ISplitReadWriteField<R, M, P>).rowField !== undefined
  );
};

export const isWriteOnlyField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Table.Field<R, M, P>
): field is Table.IWriteOnlyField<R, M, P> => {
  return (field as Table.IWriteOnlyField<R, M, P>).writeOnly === true;
};
