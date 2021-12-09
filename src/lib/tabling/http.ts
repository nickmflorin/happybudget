import { isNil, filter, reduce } from "lodash";

import * as managers from "./managers";

/* eslint-disable indent */
export const patchPayload = <
  R extends Table.RowData,
  P,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  change: Table.RowChange<R, I>,
  columns: Table.Column<R, M>[]
): P | null => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M>) => {
      if (!isNil(col.field)) {
        const cellChange: Table.CellChange<R> | undefined = change.data[col.field];
        // We might not be including data for all of the cells in the row.
        if (cellChange !== undefined) {
          let httpValue = cellChange.newValue as unknown as M[keyof M];
          if (!isNil(col.getHttpValue)) {
            httpValue = col.getHttpValue(httpValue);
          }
          return { ...p, [col.field as unknown as keyof P]: httpValue as unknown as P[keyof P] };
        }
      }
      return p;
    },
    {} as P
  );
};

export const bulkPatchPayload = <
  R extends Table.RowData,
  P,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  change: Table.RowChange<R, I>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const patch = patchPayload<R, P, M, I>(change, columns);
  if (!isNil(patch)) {
    return { id: managers.editableId(change.id), ...patch };
  }
  return null;
};

export const bulkPatchPayloads = <
  R extends Table.RowData,
  P,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  p: Table.DataChangePayload<R, I> | Table.DataChangeEvent<R, I>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, I> | Table.DataChangeEvent<R, I>
  ): obj is Table.DataChangeEvent<R, I> => (obj as Table.DataChangeEvent<R, I>).type === "dataChange";

  const payload: Table.DataChangePayload<R, I> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, I>[] = Array.isArray(payload) ? payload : [payload];
  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, I>) => {
      const patch = bulkPatchPayload<R, P, M>(change, columns);
      if (!isNil(patch)) {
        return [...prev, patch];
      }
      return prev;
    },
    []
  );
};

export const postPayload = <R extends Table.RowData, P, M extends Model.RowHttpModel = Model.RowHttpModel>(
  data: Partial<R>,
  columns: Table.Column<R, M>[]
): P => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M>) => {
      if (!isNil(col.field)) {
        let value: R[keyof R] | undefined = data[col.field];
        if (!isNil(value)) {
          if (!isNil(col.getHttpValue)) {
            value = col.getHttpValue(value);
          }
          return { ...p, [col.field as unknown as keyof P]: value as unknown as P[keyof P] };
        }
      }
      return p;
    },
    {} as P
  );
};

export const postPayloads = <R extends Table.RowData, P, M extends Model.RowHttpModel = Model.RowHttpModel>(
  p: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>,
  columns: Table.Column<R, M>[]
): P[] => {
  const isEvent = (obj: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>): obj is Table.RowAddDataEvent<R> =>
    (obj as Table.RowAddDataEvent<R>).type === "rowAdd";

  const payload: Table.RowAddDataPayload<R> = isEvent(p) ? p.payload : p;
  return reduce(
    payload,
    (prev: P[], addition: Partial<R>) => {
      return [...prev, postPayload<R, P, M>(addition, columns)];
    },
    [] as P[]
  );
};

export const createBulkUpdatePayload = <
  R extends Table.RowData,
  P,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  I extends Table.EditableRowId = Table.EditableRowId
>(
  /* eslint-disable indent */
  p: Table.DataChangePayload<R, I>,
  columns: Table.Column<R, M>[]
): Http.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads(p, columns) });

export const createBulkCreatePayload = <R extends Table.RowData, P, M extends Model.RowHttpModel = Model.RowHttpModel>(
  /* eslint-disable indent */
  p: Partial<R>[],
  columns: Table.Column<R, M>[]
): Http.BulkCreatePayload<P> => {
  return { data: postPayloads(p, columns) };
};
