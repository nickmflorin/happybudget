import * as api from "application/api";
import { logger } from "internal";
import { tabling, model } from "lib";

import * as columns from "../columns";
import * as events from "../events";
import { CellValue } from "../types";

import * as ids from "./ids";
import * as types from "./types";

const issueWarningsForParsedFieldColumn = <R extends tabling.Row, M extends model.RowTypedApiModel>(
  col: tabling.BodyColumn<R, M>,
) => {
  if (col.parsedFields?.length === 0) {
    logger.warn(
      `Empty array found for 'parsedFields' attribute of column ${col.field}. ` +
        "The 'parsedFields' array must contain at least 1 field.",
    );
  }
  if (col.getHttpValue !== undefined) {
    logger.warn(
      `Column ${col.field} defines 'getHttpValue' but also defines 'parsedFields'. ` +
        "The 'getHttpValue' callback is ignored because the column's contribution " +
        "to the HTTP payload is dictated by the individual 'parsedFields'.",
    );
  }
};

export const patchPayload = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  change: events.RowChange<R>,
  cs: columns.ModelColumn<R, M>[],
): P | null =>
  cs.reduce((p: P, col: columns.ModelColumn<R, M>) => {
    if (columns.isBodyColumn(col)) {
      /* If the column defines `parsedFields` and `parseIntoFields`, the column value is derived
         from the Column(s) with fields dictated by the `parsedFields` array.  In this case, the
         Column's field itself won't be in the set of CellChange(s) on the RowChange, but the
         individual `parsedFields` will be. */
      if (col.parsedFields !== undefined) {
        /* Issue some warnings for edge cases just in case a Column is not configured entirely
           properly. */
        issueWarningsForParsedFieldColumn(col);
        return {
          ...p,
          ...col.parsedFields.reduce(
            (
              prev: { [key in columns.ColumnFieldName<R>]: CellValue<R> },
              fld: string,
            ): { [key in columns.ColumnFieldName<R>]: CellValue<R> } => {
              // The CellChange will not be defined if the parsedField didn't actually change.
              const cellChange: events.CellChange<R> | undefined =
                change.data[fld as columns.ColumnFieldName<R>];
              if (cellChange !== undefined) {
                return { ...prev, [fld]: cellChange.newValue };
              }
              return prev;
            },
            {} as { [key in columns.ColumnFieldName<R>]: CellValue<R> },
          ),
        };
      }
      const cellChange: events.CellChange<R> | undefined = change.data[col.field];
      /* The row change will usually not have changes specified for every single columns - only the
         ones that have changed. */
      if (cellChange !== undefined) {
        const cellHttpValue = cellChange.newValue;
        if (col.getHttpValue !== undefined) {
          const callbackHttpValue = col.getHttpValue(cellHttpValue);
          return { ...p, [col.field]: callbackHttpValue };
        }
        return { ...p, [col.field]: cellHttpValue };
      }
    }
    return p;
  }, {} as P);

export const bulkPatchPayload = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  change: events.RowChange<R>,
  cs: columns.ModelColumn<R, M>[],
): api.ModelBulkUpdatePayload<P> | null => {
  const patch = patchPayload<R, M, P>(change, cs);
  if (patch !== null) {
    return { id: ids.editableId(change.id), ...patch };
  }
  return null;
};

export const bulkPatchPayloads = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  p: events.ChangeEvent<"dataChange", R>["payload"] | events.ChangeEvent<"dataChange", R>,
  cs: columns.ModelColumn<R, M>[],
): api.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: events.ChangeEvent<"dataChange", R>["payload"] | events.ChangeEvent<"dataChange", R>,
  ): obj is events.ChangeEvent<"dataChange", R> =>
    (obj as events.ChangeEvent<"dataChange", R>).type === "dataChange";

  const payload: events.ChangeEvent<"dataChange", R>["payload"] = isEvent(p) ? p.payload : p;
  const changes: events.RowChange<R>[] = Array.isArray(payload) ? payload : [payload];

  return changes.reduce(
    (
      prev: api.ModelBulkUpdatePayload<P>[],
      change: events.RowChange<R>,
    ): api.ModelBulkUpdatePayload<P>[] => {
      const patch = bulkPatchPayload<R, M, P>(change, cs);
      if (patch !== null) {
        return [...prev, patch];
      }
      return prev;
    },
    [],
  );
};

export const postPayload = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  data: types.GetRowData<R>,
  cs: columns.ModelColumn<R, M>[],
): P =>
  cs.reduce((p: P, col: columns.ModelColumn<R, M>) => {
    if (columns.isBodyColumn(col)) {
      /* I do not understand why we have to force coerce this type here, but there is some room
         for improvement in terms of how we iterate over columns and treat the fields of the
         columns.  We should start treating the columns as readonly arrays. */
      const value: CellValue<R> | undefined = data[col.field] as CellValue<R> | undefined;
      if (value !== undefined) {
        if (col.getHttpValue !== undefined) {
          const httpValue = col.getHttpValue(value);
          return { ...p, [col.field]: httpValue };
        }
        return { ...p, [col.field]: value };
      }
    }
    return p;
  }, {} as P);

export const postPayloads = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  p: events.RowAddDataPayload<R>["data"] | events.ChangeEvent<"rowAddData", R>,
  cs: columns.ModelColumn<R, M>[],
): P[] => {
  const isEvent = (
    obj: events.RowAddDataPayload<R>["data"] | events.ChangeEvent<"rowAddData", R>,
  ): obj is events.ChangeEvent<"rowAddData", R> =>
    (obj as events.ChangeEvent<"rowAddData", R>).type === "rowAddData";

  const payload: events.RowAddDataPayload<R>["data"] = isEvent(p) ? p.payload.data : p;
  return payload.reduce(
    (prev: P[], addition: tabling.GetRowData<R>): P[] => [
      ...prev,
      postPayload<R, M, P>(addition, cs),
    ],
    [] as P[],
  );
};

export const createBulkUpdatePayload = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  p: events.ChangeEvent<"dataChange", R>["payload"],
  cs: columns.ModelColumn<R, M>[],
): api.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads<R, M, P>(p, cs) });

export const createBulkCreatePayload = <
  R extends types.Row,
  M extends model.RowTypedApiModel,
  P extends api.PayloadData,
>(
  p: events.RowAddDataPayload<R>["data"],
  cs: columns.ModelColumn<R, M>[],
): api.BulkCreatePayload<P> => ({ data: postPayloads<R, M, P>(p, cs) });
