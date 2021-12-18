import { isNil, filter, reduce } from "lodash";

import * as managers from "./managers";

export const patchPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  change: Table.RowChange<R, I>,
  columns: C[]
): P | null => {
  const cols = filter(columns, (c: C) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: C) => {
      if (!isNil(col.field)) {
        const cellChange: Table.CellChange<Table.InferColumnValue<C>> | undefined = change.data[col.field];
        // We might not be including data for all of the cells in the row.
        if (cellChange !== undefined) {
          const cellHttpValue = cellChange.newValue;
          if (!isNil(col.getHttpValue)) {
            const callbackHttpValue = col.getHttpValue(cellHttpValue);
            return { ...p, [col.field]: callbackHttpValue };
          }
          return { ...p, [col.field]: cellHttpValue };
        }
      }
      return p;
    },
    {} as P
  );
};

export const bulkPatchPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  change: Table.RowChange<R, I>,
  columns: C[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const patch = patchPayload<R, M, P, C, I>(change, columns);
  if (!isNil(patch)) {
    return { id: managers.editableId(change.id), ...patch };
  }
  return null;
};

export const bulkPatchPayloads = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  p: Table.DataChangePayload<R, I> | Table.DataChangeEvent<R, I>,
  columns: C[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, I> | Table.DataChangeEvent<R, I>
  ): obj is Table.DataChangeEvent<R, I> => (obj as Table.DataChangeEvent<R, I>).type === "dataChange";

  const payload: Table.DataChangePayload<R, I> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, I>[] = Array.isArray(payload) ? payload : [payload];
  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, I>) => {
      const patch = bulkPatchPayload<R, M, P, C, I>(change, columns);
      if (!isNil(patch)) {
        return [...prev, patch];
      }
      return prev;
    },
    []
  );
};

export const postPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  data: Partial<R>,
  columns: C[]
): P => {
  const cols = filter(columns, (c: C) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: C) => {
      if (!isNil(col.field)) {
        const value: Table.InferColumnValue<C> = data[col.field] as Table.InferColumnValue<C>;
        if (!isNil(value)) {
          if (!isNil(col.getHttpValue)) {
            const httpValue = col.getHttpValue(value);
            return { ...p, [col.field]: httpValue };
          }
          return { ...p, [col.field]: value };
        }
      }
      return p;
    },
    {} as P
  );
};

export const postPayloads = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  p: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>,
  columns: C[]
): P[] => {
  const isEvent = (obj: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>): obj is Table.RowAddDataEvent<R> =>
    (obj as Table.RowAddDataEvent<R>).type === "rowAdd";

  const payload: Table.RowAddDataPayload<R> = isEvent(p) ? p.payload : p;
  return reduce(
    payload,
    (prev: P[], addition: Partial<R>) => {
      return [...prev, postPayload<R, M, P, C>(addition, columns)];
    },
    [] as P[]
  );
};

export const createBulkUpdatePayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  p: Table.DataChangePayload<R, I>,
  columns: C[]
): Http.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads<R, M, P, C, I>(p, columns) });

export const createBulkCreatePayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  p: Partial<R>[],
  columns: C[]
): Http.BulkCreatePayload<P> => {
  return { data: postPayloads<R, M, P, C>(p, columns) };
};
