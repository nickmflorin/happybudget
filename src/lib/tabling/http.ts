import { isNil, filter, map, reduce } from "lodash";

import * as rows from "./rows";

/* eslint-disable indent */
export const patchPayloadForChange = <
  R extends Table.RowData,
  P,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  change: Table.RowChange<R, M, RW>,
  columns: Table.Column<R, M>[]
): P | null => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M>) => {
      const cellChange: Table.CellChange<R, Table.RowValue<R>> | undefined = change.data[col.field];
      // We might not be including data for all of the cells in the row.
      if (cellChange !== undefined) {
        let httpValue = cellChange.newValue as unknown as M[keyof M];
        if (!isNil(col.getHttpValue)) {
          httpValue = col.getHttpValue(httpValue);
        }
        return { ...p, [col.field as unknown as keyof P]: httpValue as unknown as P[keyof P] };
      }
      return p;
    },
    {} as P
  );
};

export const bulkPatchPayloadForChange = <
  R extends Table.RowData,
  P,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  change: Table.RowChange<R, M, RW>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  return { id: rows.httpId(change.id), ...patchPayloadForChange(change, columns) };
};

export const bulkPatchPayloads = <
  R extends Table.RowData,
  P,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  p: Table.DataChangePayload<R, M, RW> | Table.DataChangeEvent<R, M, RW>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, M, RW> | Table.DataChangeEvent<R, M, RW>
  ): obj is Table.DataChangeEvent<R, M, RW> => (obj as Table.DataChangeEvent<R, M, RW>).type === "dataChange";

  const payload: Table.DataChangePayload<R, M, RW> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, M, RW>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, M, RW>) => {
      const patchPayload = bulkPatchPayloadForChange<R, P, M>(change, columns);
      if (!isNil(patchPayload)) {
        return [...prev, patchPayload];
      }
      return prev;
    },
    []
  );
};

export const postPayloadForAddition = <R extends Table.RowData, P, M extends Model.HttpModel = Model.HttpModel>(
  addition: Table.RowAdd<R>,
  columns: Table.Column<R, M>[]
): P => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M>) => {
      const cellAdd: Table.CellAdd<R> | undefined = addition.data[col.field];
      // We might not be including data for all of the cells in the row.
      if (cellAdd !== undefined) {
        let httpValue = cellAdd.value;
        if (!isNil(col.getHttpValue)) {
          httpValue = col.getHttpValue(httpValue);
        }
        return { ...p, [col.field as unknown as keyof P]: httpValue as unknown as P[keyof P] };
      }
      return p;
    },
    {} as P
  );
};

export const postPayloads = <R extends Table.RowData, P, M extends Model.HttpModel = Model.HttpModel>(
  p: Table.RowAddPayload<R> | Table.RowAddEvent<R>,
  columns: Table.Column<R, M>[]
): P[] => {
  const isEvent = (obj: Table.RowAddPayload<R> | Table.RowAddEvent<R>): obj is Table.RowAddEvent<R> =>
    (obj as Table.RowAddEvent<R>).type === "rowAdd";

  const payload: Table.RowAddPayload<R> = isEvent(p) ? p.payload : p;
  const additions: Table.RowAdd<R>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    additions,
    (prev: P[], addition: Table.RowAdd<R>) => {
      return [...prev, postPayloadForAddition<R, P, M>(addition, columns)];
    },
    [] as P[]
  );
};

export const createAutoIndexedBulkCreatePayload = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
>(
  /* eslint-disable indent */
  count: number,
  rws: Table.Row<R, M>[],
  autoIndexField: keyof R
): Http.BulkCreatePayload<any> => {
  const converter = (r: R): number | null => {
    if (!isNil(r[autoIndexField]) && !isNaN(parseInt(String(r[autoIndexField])))) {
      return parseInt(String(r[autoIndexField]));
    }
    return null;
  };
  const numericIndices: number[] = filter(
    map(rws, converter),
    (identifier: number | null) => identifier !== null
  ) as number[];
  // Apparently, Math.max() (no arguments) is not 0, it is -Infinity.  Dumb
  const baseIndex = numericIndices.length === 0 ? 0 : Math.max(...numericIndices);
  return {
    data: Array(count)
      .fill(0)
      .map((_, i: number) => ({ identifier: String(baseIndex + i + 1) }))
  };
};

type AutoIndexParams<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
  rows: Table.Row<R, M>[];
  autoIndex: boolean;
  field: keyof R;
};

export const createBulkUpdatePayload = <
  R extends Table.RowData,
  P,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
>(
  /* eslint-disable indent */
  p: Table.DataChangePayload<R, M, RW>,
  columns: Table.Column<R, M>[]
): Http.BulkUpdatePayload<P> => ({ data: bulkPatchPayloads(p, columns) });

export const createBulkCreatePayload = <R extends Table.RowData, P, M extends Model.HttpModel = Model.HttpModel>(
  /* eslint-disable indent */
  p: Table.RowAddPayload<R>,
  columns: Table.Column<R, M>[],
  autoIndexParams?: AutoIndexParams<R, M>
): Http.BulkCreatePayload<P> => {
  let bulkPayload: Http.BulkCreatePayload<P>;

  if (!isNil(autoIndexParams) && autoIndexParams.autoIndex === true && typeof p === "number") {
    bulkPayload = createAutoIndexedBulkCreatePayload(
      p,
      autoIndexParams.rows,
      autoIndexParams.field
    ) as Http.BulkCreatePayload<P>;
  } else {
    bulkPayload = { data: postPayloads(p, columns) };
  }
  return bulkPayload;
};
