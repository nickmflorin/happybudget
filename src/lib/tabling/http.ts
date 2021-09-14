import { tabling } from "lib";
import { isNil, filter, map, reduce, find } from "lodash";

/* eslint-disable indent */
export const patchPayloadForChange = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  change: Table.RowChange<R, M>,
  row: Table.ModelRow<R, M>,
  columns: Table.Column<R, M, G>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const cols = filter(columns, (c: Table.Column<R, M, G>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: Http.ModelBulkUpdatePayload<P>, col: Table.Column<R, M, G>) => {
      const cellChange: Table.CellChange<R, Table.RowValue<R>> | undefined = change.data[col.field];
      // We might not be including data for all of the cells in the row.
      if (cellChange !== undefined) {
        let httpValue = cellChange.newValue as unknown as M[keyof M];
        if (!isNil(col.getModelValue)) {
          // We can safely coerce to Table.ModelRow here because we already excluded the change if
          // it is in regard to a placeholder.
          httpValue = col.getModelValue({ ...row, data: { ...row.data, [col.field]: cellChange.newValue } });
        }
        if (!isNil(col.getHttpValue)) {
          httpValue = col.getHttpValue(httpValue);
        }
        return { ...p, [col.field as unknown as keyof P]: httpValue as unknown as P[keyof P] };
      }
      return p;
    },
    { id: change.id }
  );
};

export const patchPayloads = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  p: Table.DataChangePayload<R, M> | Table.DataChangeEvent<R, M>,
  columns: Table.Column<R, M, G>[],
  rows: Table.Row<R, M>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, M> | Table.DataChangeEvent<R, M>
  ): obj is Table.DataChangeEvent<R, M> => (obj as Table.DataChangeEvent<R, M>).type === "dataChange";

  const payload: Table.DataChangePayload<R, M> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, M>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, M>) => {
      const row: Table.Row<R, M> | undefined = find(rows, { id: change.id });
      if (!isNil(row) && tabling.typeguards.isModelRow(row)) {
        const patchPayload = patchPayloadForChange<R, P, M, G>(change, row, columns);
        if (!isNil(patchPayload)) {
          return [...prev, patchPayload];
        }
      }
      return prev;
    },
    []
  );
};

export const postPayloadForAddition = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  addition: Table.RowAdd<R>,
  columns: Table.Column<R, M, G>[]
): P => {
  const cols = filter(columns, (c: Table.Column<R, M, G>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M, G>) => {
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

export const postPayloads = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  p: Table.RowAddPayload<R> | Table.RowAddEvent<R>,
  columns: Table.Column<R, M, G>[]
): P[] => {
  const isEvent = (obj: Table.RowAddPayload<R> | Table.RowAddEvent<R>): obj is Table.RowAddEvent<R> =>
    (obj as Table.RowAddEvent<R>).type === "rowAdd";

  const payload: Table.RowAddPayload<R> = isEvent(p) ? p.payload : p;
  const additions: Table.RowAdd<R>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    additions,
    (prev: P[], addition: Table.RowAdd<R>) => {
      return [...prev, postPayloadForAddition<R, P, M, G>(addition, columns)];
    },
    [] as P[]
  );
};

export const createAutoIndexedBulkCreatePayload = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  /* eslint-disable indent */
  count: number,
  rows: Table.Row<R, M>[],
  autoIndexField: keyof R
): Http.BulkCreatePayload<any> => {
  const converter = (r: R): number | null => {
    if (!isNil(r[autoIndexField]) && !isNaN(parseInt(String(r[autoIndexField])))) {
      return parseInt(String(r[autoIndexField]));
    }
    return null;
  };
  const numericIndices: number[] = filter(
    map(rows, converter),
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

type AutoIndexParams<R extends Table.RowData, M extends Model.Model = Model.Model> = {
  rows: Table.Row<R, M>[];
  autoIndex: boolean;
  field: keyof R;
};

export const createBulkUpdatePayload = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  /* eslint-disable indent */
  p: Table.DataChangePayload<R, M>,
  columns: Table.Column<R, M, G>[],
  rows: Table.Row<R, M>[]
): Http.BulkUpdatePayload<P> => ({ data: patchPayloads(p, columns, rows) });

export const createBulkCreatePayload = <
  R extends Table.RowData,
  P,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  /* eslint-disable indent */
  p: Table.RowAddPayload<R>,
  columns: Table.Column<R, M, G>[],
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
