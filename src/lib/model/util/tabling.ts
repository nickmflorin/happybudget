import React from "react";
import { groupBy, isNil, reduce, find, forEach, includes, filter, map } from "lodash";
import { ColDef } from "@ag-grid-community/core";

import * as models from "lib/model";
import { getKeyValue } from "lib/util";
import { contrastedForegroundColor } from "lib/util/colors";
import { tableChangeIsCellChange, tableChangeIsRowChange } from "../typeguards/tabling";

export const getGroupColorDefinition = (group: Model.Group): Table.RowColorDefinition => {
  if (!isNil(group) && !isNil(group.color)) {
    let backgroundColor = group.color;
    if (!isNil(backgroundColor)) {
      if (!backgroundColor.startsWith("#")) {
        backgroundColor = `#${group.color}`;
      }
      return {
        backgroundColor,
        color: contrastedForegroundColor(backgroundColor)
      };
    }
  }
  return {};
};

type ColumnTypeVariantOptions = {
  header?: boolean;
  pdf?: boolean;
};

export const getColumnTypeCSSStyle = (
  type: Table.ColumnTypeId | Table.ColumnType,
  options: ColumnTypeVariantOptions = { header: false, pdf: false }
): React.CSSProperties => {
  let colType: Table.ColumnType;
  if (typeof type === "string") {
    const ct: Table.ColumnType | undefined = find(models.ColumnTypes, { id: type } as any);
    if (isNil(ct)) {
      return {};
    }
    colType = ct;
  } else {
    colType = type;
  }
  let style = colType.style || {};
  if (options.header === true && !isNil(colType.headerOverrides)) {
    style = { ...style, ...(colType.headerOverrides.style || {}) };
  }
  if (options.pdf === true && !isNil(colType.pdfOverrides)) {
    style = { ...style, ...(colType.pdfOverrides.style || {}) };
  }
  return style;
};

export const toAgGridColDef = <R extends Table.Row = Table.Row, M extends Model.Model = Model.Model, V = any>(
  column: Table.Column<R, M, V>
): ColDef => {
  const {
    nullValue,
    isCalculated,
    processCellForClipboard,
    processCellFromClipboard,
    type,
    budget,
    footer,
    ...original
  } = column;
  original.cellStyle = { ...getColumnTypeCSSStyle(column.type), ...original.cellStyle };
  return original as ColDef;
};

export const cellChangeToNestedCellChange = <R extends Table.Row, M extends Model.Model>(
  cellChange: Table.CellChange<R, M>
): Table.NestedCellChange<R, M> => {
  return {
    oldValue: cellChange.oldValue,
    newValue: cellChange.newValue,
    column: cellChange.column,
    row: cellChange.row
  };
};

export const cellChangeToRowChange = <R extends Table.Row, M extends Model.Model>(
  cellChange: Table.CellChange<R, M>
): Table.RowChange<R, M> => {
  let rowChange: Table.RowChange<R, M> = {
    id: cellChange.id,
    data: {}
  };
  let rowChangeData: Table.RowChangeData<R, M> = {};
  rowChangeData = {
    ...rowChangeData,
    [cellChange.field as string]: cellChangeToNestedCellChange(cellChange)
  };
  rowChange = {
    ...rowChange,
    data: rowChangeData
  };
  return rowChange;
};

export const addCellChangeToRowChange = <R extends Table.Row, M extends Model.Model>(
  rowChange: Table.RowChange<R, M>,
  cellChange: Table.CellChange<R, M>
): Table.RowChange<R, M> => {
  let newRowChange = { ...rowChange };
  const fieldChange = getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(cellChange.field)(newRowChange.data) as
    | Omit<Table.CellChange<R, M>, "field" | "id">
    | undefined;
  if (isNil(fieldChange)) {
    newRowChange = {
      ...newRowChange,
      data: {
        ...newRowChange.data,
        [cellChange.field as string]: cellChangeToNestedCellChange(cellChange)
      }
    };
  } else {
    // If the Table.CellChange field is already in the Table.RowChange data, that means
    // it was changed multiple times.  We want to maintain the original `oldValue` but just
    // alter the `newValue`.
    newRowChange = {
      ...newRowChange,
      data: {
        ...newRowChange.data,
        [cellChange.field as string]: { ...fieldChange, newValue: cellChange.newValue }
      }
    };
  }
  return newRowChange;
};

export const reduceChangesForRow = <R extends Table.Row, M extends Model.Model>(
  initial: Table.RowChange<R, M> | Table.CellChange<R, M>,
  change: Table.RowChange<R, M> | Table.CellChange<R, M>
): Table.RowChange<R, M> => {
  if (initial.id !== change.id) {
    throw new Error("Cannot reduce table changes for different rows.");
  }
  const initialRowChange: Table.RowChange<R, M> = tableChangeIsRowChange(initial)
    ? initial
    : cellChangeToRowChange(initial);
  if (tableChangeIsCellChange(change)) {
    return addCellChangeToRowChange(initialRowChange, change);
  } else {
    let rowChange = { ...initialRowChange };
    Object.keys(change.data).forEach((key: Table.Field<R, M>) => {
      const cellChange = getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(change.data) as Omit<
        Table.CellChange<R, M>,
        "field" | "id"
      >;
      rowChange = addCellChangeToRowChange(rowChange, { ...cellChange, field: key, id: rowChange.id });
    });
    return rowChange;
  }
};

export const consolidateTableChange = <R extends Table.Row, M extends Model.Model>(
  change: Table.Change<R, M>
): Table.ConsolidatedChange<R, M> => {
  if (Array.isArray(change)) {
    const grouped = groupBy(change, "id") as {
      [key: number]: (Table.RowChange<R, M> | Table.CellChange<R, M, R[keyof R]>)[];
    };
    const merged: Table.RowChange<R, M>[] = Object.keys(grouped).map((id: string) => {
      const initial: Table.RowChange<R, M> = { id: parseInt(id), data: {} };
      return reduce(grouped[parseInt(id)], reduceChangesForRow, initial);
    });
    return merged;
  } else if (tableChangeIsCellChange(change)) {
    return [cellChangeToRowChange(change)];
  } else {
    return [change];
  }
};

export const mergeChangesWithModel = <R extends Table.Row, M extends Model.Model>(
  model: M,
  changes: Table.Change<R, M>
): M => {
  const consolidated: Table.ConsolidatedChange<R, M> = consolidateTableChange<R, M>(changes);

  let newModel = { ...model };
  forEach(consolidated, (change: Table.RowChange<R, M>) => {
    if (change.id !== model.id) {
      throw new Error("Trying to apply table changes to a model that were created for another model!");
    }
    Object.keys(change.data).forEach((key: Table.Field<R, M>) => {
      const cellChange = getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(
        change.data
      ) as Table.NestedCellChange<R, M>;
      let value = cellChange.newValue;
      if (!isNil(cellChange.column.getModelValue)) {
        value = cellChange.column.getModelValue(cellChange.row);
      }
      newModel = { ...newModel, [key as string]: value };
    });
  });
  return newModel;
};

export const payload = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  p: Table.RowChange<R, M> | Table.RowAdd<R, M>
): Partial<P> => {
  /* eslint-disable no-unused-vars */
  const payloadObj: { [key: string]: any } = {};

  const isCellAdd = (
    obj: Table.NestedCellChange<R, M> | Table.NestedCellAdd<R, M>
  ): obj is Table.NestedCellAdd<R, M> => {
    return (obj as Table.NestedCellAdd<R, M>).value !== undefined;
  };

  Object.keys(p.data).forEach((key: Table.Field<R, M>) => {
    const cellDelta = getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(p.data) as
      | Table.NestedCellChange<R, M>
      | Table.NestedCellAdd<R, M>;

    const fieldBehavor: Table.FieldBehavior[] = cellDelta.column.fieldBehavior || ["read", "write"];
    if (includes(fieldBehavor, "write")) {
      let httpValue: any;
      if (isCellAdd(cellDelta)) {
        httpValue = cellDelta.value;
      } else {
        if (!isNil(cellDelta.column.getModelValue)) {
          httpValue = cellDelta.column.getModelValue(cellDelta.row);
        } else {
          httpValue = cellDelta.newValue;
        }
      }
      if (!isNil(cellDelta.column.getHttpValue)) {
        httpValue = cellDelta.column.getHttpValue(httpValue);
      }
      payloadObj[key as string] = httpValue;
    }
  });
  return payloadObj as Partial<P>;
};

export const createAutoIndexedBulkCreatePayload = <M extends Model.Model>(
  /* eslint-disable indent */
  count: number,
  ms: M[],
  autoIndexField: keyof M
): Http.BulkCreatePayload<any> => {
  const converter = (model: M): number | null => {
    if (!isNil(model[autoIndexField]) && !isNaN(parseInt(String(model[autoIndexField])))) {
      return parseInt(String(model[autoIndexField]));
    }
    return null;
  };
  const numericIndices: number[] = filter(
    map(ms, converter),
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

type AutoIndexParams<M extends Model.Model> = {
  models: M[];
  autoIndex: boolean;
  field: keyof M;
};

export const createBulkCreatePayload = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  /* eslint-disable indent */
  p: Table.RowAddPayload<R, M>,
  autoIndexParams?: AutoIndexParams<M>
): Http.BulkCreatePayload<P> => {
  let bulkPayload: Http.BulkCreatePayload<P>;

  if (!isNil(autoIndexParams) && autoIndexParams.autoIndex === true && typeof p === "number") {
    bulkPayload = createAutoIndexedBulkCreatePayload(
      p,
      autoIndexParams.models,
      autoIndexParams.field
    ) as Http.BulkCreatePayload<P>;
  } else if (typeof p === "number") {
    bulkPayload = { count: p };
  } else if (!Array.isArray(p)) {
    bulkPayload = { data: [payload(p)] };
  } else {
    bulkPayload = { data: map(p, (pi: Table.RowAdd<R, M>) => payload(pi)) };
  }
  return bulkPayload;
};
