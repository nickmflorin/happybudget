import { isNil, reduce } from "lodash";

import * as managers from "./managers";

export const patchPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  change: Table.RowChange<R, RW>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): P | null => {
  return reduce(
    columns,
    (p: P, col: Table.BodyColumn<R, M, Table.RawRowValue>) => {
      const cellChange: Table.CellChange<Table.InferV<typeof col>> | undefined =
        change.data[col.field as keyof RW["data"]];
      // We might not be including data for all of the cells in the row.
      if (cellChange !== undefined) {
        const cellHttpValue = cellChange.newValue;
        if (!isNil(col.getHttpValue)) {
          const callbackHttpValue = col.getHttpValue(cellHttpValue);
          return { ...p, [col.field]: callbackHttpValue };
        }
        return { ...p, [col.field]: cellHttpValue };
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
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  change: Table.RowChange<R, RW>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const patch = patchPayload<R, M, P, RW>(change, columns);
  if (!isNil(patch)) {
    return { id: managers.editableId(change.id), ...patch };
  }
  return null;
};

export const bulkPatchPayloads = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  p: Table.DataChangePayload<R, RW> | Table.DataChangeEvent<R, RW>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, RW> | Table.DataChangeEvent<R, RW>
  ): obj is Table.DataChangeEvent<R, RW> => (obj as Table.DataChangeEvent<R, RW>).type === "dataChange";

  const payload: Table.DataChangePayload<R, RW> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, RW>[] = Array.isArray(payload) ? payload : [payload];
  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, RW>) => {
      const patch = bulkPatchPayload<R, M, P, RW>(change, columns);
      if (!isNil(patch)) {
        return [...prev, patch];
      }
      return prev;
    },
    []
  );
};

export const postPayload = <R extends Table.RowData, M extends Model.RowHttpModel, P extends Http.PayloadObj>(
  data: Partial<R>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): P => {
  return reduce(
    columns,
    (p: P, col: Table.BodyColumn<R, M, Table.RawRowValue>) => {
      const value: Table.InferV<typeof col> | undefined = data[col.field] as Table.InferV<typeof col> | undefined;
      if (value !== undefined) {
        if (!isNil(col.getHttpValue)) {
          const httpValue = col.getHttpValue(value);
          return { ...p, [col.field]: httpValue };
        }
        return { ...p, [col.field]: value };
      }
      return p;
    },
    {} as P
  );
};

export const postPayloads = <R extends Table.RowData, M extends Model.RowHttpModel, P extends Http.PayloadObj>(
  p: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): P[] => {
  const isEvent = (obj: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>): obj is Table.RowAddDataEvent<R> =>
    (obj as Table.RowAddDataEvent<R>).type === "rowAdd";

  const payload: Table.RowAddDataPayload<R> = isEvent(p) ? p.payload : p;
  return reduce(
    payload,
    (prev: P[], addition: Partial<R>) => {
      return [...prev, postPayload<R, M, P>(addition, columns)];
    },
    [] as P[]
  );
};

export const createBulkUpdatePayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  p: Table.DataChangePayload<R, RW>,
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): Http.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads<R, M, P, RW>(p, columns) });

export const createBulkCreatePayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj
>(
  p: Partial<R>[],
  columns: Table.BodyColumn<R, M, Table.RawRowValue>[]
): Http.BulkCreatePayload<P> => {
  return { data: postPayloads<R, M, P>(p, columns) };
};
