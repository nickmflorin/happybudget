import { isNil, reduce } from "lodash";

import * as columns from "../columns";
import * as ids from "./ids";

const issueWarningsForParsedFieldColumn = <R extends Table.RowData, M extends Model.RowHttpModel>(
  col: Table.BodyColumn<R, M>
) => {
  if (col.parsedFields?.length === 0) {
    console.warn(
      `Empty array found for 'parsedFields' attribute of column ${col.field}. ` +
        "The 'parsedFields' array must contain at least 1 field."
    );
  }
  if (!isNil(col.getHttpValue)) {
    console.warn(
      `Column ${col.field} defines 'getHttpValue' but also defines 'parsedFields'. ` +
        "The 'getHttpValue' callback is ignored because the column's contribution " +
        "to the HTTP payload is dictated by the individual 'parsedFields'."
    );
  }
};

export const patchPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  change: Table.RowChange<R, RW>,
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): P | null =>
  reduce(
    cs,
    (p: P, col: Table.ModelColumn<R, M, Table.RawRowValue>) => {
      if (columns.isBodyColumn(col)) {
        /* If the column defines `parsedFields` and `parseIntoFields`, the column
           value is derived from the Column(s) with fields dictated by the
           `parsedFields` array.  In this case, the Column's field itself won't
           be in the set of CellChange(s) on the RowChange, but the individual
           `parsedFields` will be. */
        if (!isNil(col.parsedFields)) {
          /* Issue some warnings for edge cases just in case a Column is not
             configured entirely properly. */
          issueWarningsForParsedFieldColumn(col);
          const updates: { [key: string]: Table.RawRowValue } = reduce(
            col.parsedFields,
            (curr: { [key: string]: Table.RawRowValue }, fld: string) => {
              /* The CellChange will not be defined if the parsedField didn't
                 actually change. */
              const cellChange: Table.CellChange<Table.InferV<typeof col>> | undefined =
                change.data[fld as keyof RW["data"]];
              if (!isNil(cellChange)) {
                return { ...curr, [fld]: cellChange.newValue };
              }
              return curr;
            },
            {}
          );
          return { ...p, ...updates };
        } else {
          const cellChange: Table.CellChange<Table.InferV<typeof col>> | undefined =
            change.data[col.field as keyof RW["data"]];
          /* The row change will usually not have changes specified for every
         		 single columns - only the ones that have changed. */
          if (cellChange !== undefined) {
            const cellHttpValue = cellChange.newValue;
            if (!isNil(col.getHttpValue)) {
              const callbackHttpValue = col.getHttpValue(cellHttpValue);
              return { ...p, [col.field]: callbackHttpValue };
            }
            return { ...p, [col.field]: cellHttpValue };
          }
        }
      }
      return p;
    },
    {} as P
  );

export const bulkPatchPayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj,
  RW extends Table.EditableRow<R> = Table.EditableRow<R>
>(
  change: Table.RowChange<R, RW>,
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const patch = patchPayload<R, M, P, RW>(change, cs);
  if (!isNil(patch)) {
    return { id: ids.editableId(change.id), ...patch };
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
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, RW> | Table.DataChangeEvent<R, RW>
  ): obj is Table.DataChangeEvent<R, RW> => (obj as Table.DataChangeEvent<R, RW>).type === "dataChange";

  const payload: Table.DataChangePayload<R, RW> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, RW>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, RW>) => {
      const patch = bulkPatchPayload<R, M, P, RW>(change, cs);
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
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): P => {
  return reduce(
    cs,
    (p: P, col: Table.ModelColumn<R, M, Table.RawRowValue>) => {
      if (columns.isBodyColumn(col)) {
        const value: Table.InferV<typeof col> | undefined = data[col.field] as Table.InferV<typeof col> | undefined;
        if (value !== undefined) {
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

export const postPayloads = <R extends Table.RowData, M extends Model.RowHttpModel, P extends Http.PayloadObj>(
  p: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>,
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): P[] => {
  const isEvent = (obj: Table.RowAddDataPayload<R> | Table.RowAddDataEvent<R>): obj is Table.RowAddDataEvent<R> =>
    (obj as Table.RowAddDataEvent<R>).type === "rowAdd";

  const payload: Table.RowAddDataPayload<R> = isEvent(p) ? p.payload : p;
  return reduce(
    payload,
    (prev: P[], addition: Partial<R>) => {
      return [...prev, postPayload<R, M, P>(addition, cs)];
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
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): Http.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads<R, M, P, RW>(p, cs) });

export const createBulkCreatePayload = <
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  P extends Http.PayloadObj
>(
  p: Partial<R>[],
  cs: Table.ModelColumn<R, M, Table.RawRowValue>[]
): Http.BulkCreatePayload<P> => ({ data: postPayloads<R, M, P>(p, cs) });
