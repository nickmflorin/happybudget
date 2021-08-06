import React from "react";
import classNames from "classnames";
import { groupBy, isNil, reduce, find, forEach, includes, filter, map, orderBy } from "lodash";
import { CellRange } from "@ag-grid-community/core";

import { util } from "lib";
import { ColumnTypes } from "./models";
import {
  tableChangeIsCellChange,
  tableChangeIsRowChange,
  isDataChangeEvent,
  isRowAddEvent,
  isFullRowEvent,
  isRowDeleteEvent
} from "./typeguards";

export const rangeSelectionIsSingleCell = (range: CellRange) => {
  if (range.startRow?.rowIndex === range.endRow?.rowIndex && range.columns.length === 1) {
    return true;
  }
  return false;
};

export const mergeClassNames = <T>(params: T, ...args: Table.ClassName<T>[]): string => {
  const stringClassNames = map(args, (arg: Table.ClassName<T>) => {
    if (typeof arg === "function") {
      return arg(params);
    } else if (Array.isArray(arg)) {
      return mergeClassNames(params, ...arg);
    }
    return arg;
  });
  return classNames(stringClassNames);
};

export const combineFrameworks = (...args: (Table.Framework | undefined | null)[]): Table.Framework => {
  return reduce(
    args,
    (prev: Table.Framework, curr: Table.Framework | null | undefined) => {
      return {
        ...prev,
        editors: { ...prev.editors, ...curr?.editors },
        cells: {
          data: {
            ...prev.cells?.data,
            ...curr?.cells?.data
          },
          footer: {
            ...prev.cells?.footer,
            ...curr?.cells?.footer
          },
          page: {
            ...prev.cells?.page,
            ...curr?.cells?.page
          }
        }
      };
    },
    { cells: { data: {}, footer: {}, page: {} }, editors: {} }
  );
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
    const ct: Table.ColumnType | undefined = find(ColumnTypes, { id: type } as any);
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

export const orderColumns = <C extends Table.DualColumn<R, M>, R extends Table.Row, M extends Model.Model>(
  columns: C[]
): C[] => {
  const columnsWithIndex = filter(columns, (col: C) => !isNil(col.index));
  const columnsWithoutIndexNotCalculated = filter(columns, (col: C) => isNil(col.index) && col.isCalculated !== true);
  const columnsWithoutIndexCalculated = filter(columns, (col: C) => isNil(col.index) && col.isCalculated === true);
  return [
    ...orderBy(columnsWithIndex, ["index"], ["asc"]),
    ...columnsWithoutIndexNotCalculated,
    ...columnsWithoutIndexCalculated
  ];
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
  const fieldChange = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(cellChange.field)(
    newRowChange.data
  ) as Omit<Table.CellChange<R, M>, "field" | "id"> | undefined;
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
      const cellChange = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(change.data) as Omit<
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
      const cellChange = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(
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

export const cellChangeWarantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  change: Table.CellChange<R, M> | Table.NestedCellChange<R, M>
): boolean => change.column.isCalculating === true;

export const rowChangeWarrantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  change: Table.RowChange<R, M>
): boolean =>
  /* eslint-disable indent */
  filter(change.data, (value: Table.NestedCellChange<R, M>) => cellChangeWarantsRecalculation(value)).length !== 0;

export const changeWarrantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  change: Table.Change<R, M>
): boolean => {
  const arrayChanges: (Table.RowChange<R, M> | Table.CellChange<R, M>)[] = Array.isArray(change) ? change : [change];
  return (
    filter(arrayChanges, (ch: Table.RowChange<R, M> | Table.CellChange<R, M>) =>
      tableChangeIsRowChange(ch) ? rowChangeWarrantsRecalculation(ch) : cellChangeWarantsRecalculation(ch)
    ).length !== 0
  );
};

export const addWarrantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  add: Table.RowAdd<R, M>
): boolean =>
  /* eslint-disable indent */
  filter(add.data, (value: Table.NestedCellAdd<R, M>) => value.column.isCalculating === true).length !== 0;

export const additionsWarrantParentRefresh = <R extends Table.Row, M extends Model.Model>(
  additions: Table.RowAddPayload<R, M>
): boolean => {
  // If the payload is just a number, we are just creating a certain number of blank
  // rows - so no refresh is warranted.
  if (typeof additions === "number") {
    return false;
  }
  return Array.isArray(additions)
    ? filter(additions, (add: Table.RowAdd<R, M>) => addWarrantsRecalculation(add) === true).length !== 0
    : addWarrantsRecalculation(additions);
};

export const rowWarrantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  row: R,
  columns: Table.Column<R, M>[]
): boolean => {
  return (
    reduce(
      columns,
      (data: boolean[], column: Table.Column<R, M>) => {
        if (column.isCalculating === true) {
          const nullValue = column.nullValue === undefined ? null : column.nullValue;
          if (row[column.field as keyof R] !== nullValue) {
            return [...data, true];
          }
        }
        return data;
      },
      []
    ).length !== 0
  );
};

export const fullRowPayloadRequiresRefresh = <R extends Table.Row, M extends Model.Model>(
  payload: Table.FullRowPayload<R, M>
): boolean => {
  const rows: R[] = Array.isArray(payload.rows) ? payload.rows : [payload.rows];
  return filter(rows, (row: R) => rowWarrantsRecalculation<R, M>(row, payload.columns)).length !== 0;
};

// Not applicable for GroupDeleteEvent because deletion of a group should not
// warrant any recalculation of that deleted group.
export const eventWarrantsGroupRecalculation = <R extends Table.Row, M extends Model.Model>(
  e:
    | Table.DataChangeEvent<R, M>
    | Table.RowAddEvent<R, M>
    | Table.RowDeleteEvent<R, M>
    | Table.RowRemoveFromGroupEvent<R, M>
    | Table.RowAddToGroupEvent<R, M>
): boolean => {
  if (isDataChangeEvent(e) || isRowAddEvent(e) || isRowDeleteEvent(e)) {
    return eventWarrantsRecalculation(e);
  } else {
    // Only RowRemoveFromGroupEvent | RowAddToGroupEvent at this point.
    return fullRowPayloadRequiresRefresh(e.payload);
  }
};

// Not applicable for RowAddToGroupEvent, RowRemoveFromGroupEvent and GroupDeleteEvent
// because modifications to a group only cause recalculation of the group itself, not
// the parent Account/SubAccount and/or Budget/Template.
export const eventWarrantsRecalculation = <R extends Table.Row, M extends Model.Model>(
  e: Table.DataChangeEvent<R, M> | Table.RowAddEvent<R, M> | Table.RowDeleteEvent<R, M>
): boolean => {
  if (isFullRowEvent(e)) {
    return fullRowPayloadRequiresRefresh(e.payload);
  } else if (isDataChangeEvent(e)) {
    return changeWarrantsRecalculation(e.payload);
  } else {
    return additionsWarrantParentRefresh(e.payload);
  }
};

export const payload = <R extends Table.Row, M extends Model.Model, P>(
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
    const cellDelta = util.getKeyValue<Table.RowChangeData<R, M>, Table.Field<R, M>>(key)(p.data) as
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

export const createBulkCreatePayload = <R extends Table.Row, M extends Model.Model, P>(
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

export const orderModelsWithRowsByFieldOrdering = <R extends Table.Row, M extends Model.Model>(
  array: Table.ModelWithRow<R, M>[],
  fieldOrdering: FieldOrdering<keyof R>
): Table.ModelWithRow<R, M>[] => {
  return orderBy(
    array,
    (row: Table.ModelWithRow<R, M>) =>
      map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => row.row[fieldOrder.field]),
    map(fieldOrdering, (fieldOrder: FieldOrder<keyof R>) => (fieldOrder.order === 1 ? "asc" : "desc"))
  );
};

type CreateTableDataOptions<E extends Table.RowMeta, R extends Table.Row, M extends Model.Model> = {
  readonly getRowMeta?: (m: M) => E;
  readonly defaultNullValue?: Table.NullValue;
  readonly ordering?: FieldOrder<keyof R>[];
};

export const convertModelToRow = <
  C extends Table.DualColumn<R, M>,
  R extends Table.Row,
  M extends Model.Model,
  E extends Table.RowMeta
>(
  model: M,
  columns: C[],
  options?: CreateTableDataOptions<E, R, M>
): R => {
  const dataOptions = options || {};
  const defaultNullValue = dataOptions.defaultNullValue === undefined ? null : dataOptions.defaultNullValue;
  return reduce(
    columns,
    (obj: Partial<R>, col: C) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      const modelValue = !isNil(col.getRowValue)
        ? col.getRowValue(model)
        : util.getKeyValue<M, keyof M>(col.field as keyof M)(model);
      if (modelValue !== undefined) {
        obj[col.field as keyof R] = modelValue as any;
      } else {
        obj[col.field as keyof R] = nullValue as R[keyof R];
      }
      return obj;
    },
    {
      id: model.id,
      meta: !isNil(dataOptions.getRowMeta) ? dataOptions.getRowMeta(model) : {}
    } as Partial<R>
  ) as R;
};

export const createTableData = <C extends Table.DualColumn<R, M>, R extends Table.Row, M extends Model.Model>(
  columns: C[],
  data: M[],
  options?: CreateTableDataOptions<Table.RowMeta, R, M>
): Table.TableData<R, M> => {
  const dataOptions = options || {};
  const modelsWithRows = map(data, (model: M) => ({ model, row: convertModelToRow(model, columns, options) }));
  return !isNil(dataOptions.ordering)
    ? orderModelsWithRowsByFieldOrdering<R, M>(modelsWithRows, dataOptions.ordering)
    : modelsWithRows;
};

export const createBudgetTableData = <
  C extends Table.DualColumn<R, M>,
  R extends BudgetTable.Row,
  M extends Model.Model
>(
  columns: C[],
  data: M[],
  groups?: Model.Group[],
  options?: CreateTableDataOptions<BudgetTable.RowMeta, R, M>
): BudgetTable.TableData<R, M> => {
  const dataOptions: CreateTableDataOptions<BudgetTable.RowMeta, R, M> = {
    ...(options || {}),
    getRowMeta: (m: M) => ({ group: getGroupForModel(m), ...options?.getRowMeta?.(m) } as BudgetTable.RowMeta)
  };

  const getGroupForModel = (m: M): number | null => {
    if (isNil(groups)) {
      return null;
    }
    const group: Model.Group | undefined = find(groups, (g: Model.Group) => includes(g.children, m.id));
    return !isNil(group) ? group.id : null;
  };

  const modelsWithGroup: M[] = filter(data, (m: M) => !isNil(getGroupForModel(m)));
  let modelsWithoutGroup: M[] = filter(data, (m: M) => isNil(getGroupForModel(m)));

  const orderModelsWithRows = (rows: Table.ModelWithRow<R, M>[]) =>
    !isNil(dataOptions.ordering) ? orderModelsWithRowsByFieldOrdering<R, M>(rows, dataOptions.ordering) : rows;

  let groupsWithGroup: BudgetTable.RowGroup<R, M>[] = [];
  let groupWithoutGroup: BudgetTable.RowGroup<R, M> = {
    group: null,
    rows: map(modelsWithoutGroup, (m: M) => ({ model: m, row: convertModelToRow(m, columns, dataOptions) }))
  };

  const groupedModels: { [key: number]: M[] } = groupBy(modelsWithGroup, (model: M) => getGroupForModel(model));
  forEach(groupedModels, (ms: M[], groupId: string) => {
    const group: Model.Group | undefined = find(groups, { id: parseInt(groupId) } as any);
    if (!isNil(group)) {
      groupsWithGroup.push({
        group,
        rows: orderModelsWithRows(map(ms, (m: M) => ({ model: m, row: convertModelToRow(m, columns, dataOptions) })))
      });
    } else {
      // In the case that the group no longer exists, that means the group was removed from the
      // state.  In this case, we want to disassociate the rows with the group.
      groupWithoutGroup = {
        ...groupWithoutGroup,
        // Wait until the end to establish ordering for performance.
        rows: [
          ...groupWithoutGroup.rows,
          ...map(ms, (m: M) => ({ model: m, row: convertModelToRow(m, columns, dataOptions) }))
        ]
      };
    }
  });

  return [
    ...groupsWithGroup,
    {
      ...groupWithoutGroup,
      rows: orderModelsWithRows(groupWithoutGroup.rows)
    }
  ];
};
