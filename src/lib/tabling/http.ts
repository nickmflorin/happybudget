import { isNil, filter, map, reduce } from "lodash";

export const patchPayloadForChange = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  change: Table.RowChange<R, M>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P> | null => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: Http.ModelBulkUpdatePayload<P>, col: Table.Column<R, M>) => {
      const cellChange: Table.CellChange<R, M, Table.RowValue<R>> | undefined = change.data[col.field];
      // We might not be including data for all of the cells in the row.
      if (cellChange !== undefined) {
        let httpValue = cellChange.newValue as unknown as M[keyof M];
        if (!isNil(col.getModelValue)) {
          // We can safely coerce to Table.ModelRow here because we already excluded the change if
          // it is in regard to a placeholder.
          httpValue = col.getModelValue(cellChange.row);
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

export const patchPayloads = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  p: Table.DataChangePayload<R, M> | Table.DataChangeEvent<R, M>,
  columns: Table.Column<R, M>[]
): Http.ModelBulkUpdatePayload<P>[] => {
  const isEvent = (
    obj: Table.DataChangePayload<R, M> | Table.DataChangeEvent<R, M>
  ): obj is Table.DataChangeEvent<R, M> => (obj as Table.DataChangeEvent<R, M>).type === "dataChange";

  const payload: Table.DataChangePayload<R, M> = isEvent(p) ? p.payload : p;
  const changes: Table.RowChange<R, M>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    changes,
    (prev: Http.ModelBulkUpdatePayload<P>[], change: Table.RowChange<R, M>) => {
      const patchPayload = patchPayloadForChange<R, P, M>(change, columns);
      if (!isNil(patchPayload)) {
        return [...prev, patchPayload];
      }
      return prev;
    },
    []
  );
};

export const postPayloadForAddition = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  addition: Table.RowAdd<R, M>,
  columns: Table.Column<R, M>[]
): P => {
  const cols = filter(columns, (c: Table.Column<R, M>) => c.isWrite !== false);
  return reduce(
    cols,
    (p: P, col: Table.Column<R, M>) => {
      const cellAdd: Table.CellAdd<R, M> | undefined = addition.data[col.field];
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

export const postPayloads = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  p: Table.RowAddPayload<R, M> | Table.RowAddEvent<R, M>,
  columns: Table.Column<R, M>[]
): P[] => {
  const isEvent = (obj: Table.RowAddPayload<R, M> | Table.RowAddEvent<R, M>): obj is Table.RowAddEvent<R, M> =>
    (obj as Table.RowAddEvent<R, M>).type === "rowAdd";

  const payload: Table.RowAddPayload<R, M> = isEvent(p) ? p.payload : p;
  const additions: Table.RowAdd<R, M>[] = Array.isArray(payload) ? payload : [payload];

  return reduce(
    additions,
    (prev: P[], addition: Table.RowAdd<R, M>) => {
      return [...prev, postPayloadForAddition<R, P, M>(addition, columns)];
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

export const createBulkUpdatePayload = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  /* eslint-disable indent */
  p: Table.DataChangePayload<R, M>,
  columns: Table.Column<R, M>[]
): Http.BulkUpdatePayload<P> => ({ data: patchPayloads(p, columns) });

export const createBulkCreatePayload = <R extends Table.RowData, P, M extends Model.Model = Model.Model>(
  /* eslint-disable indent */
  p: Table.RowAddPayload<R, M>,
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
