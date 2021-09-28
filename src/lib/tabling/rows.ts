import { isNil, reduce, filter } from "lodash";

import * as util from "../util";
import * as events from "./events";
import * as typeguards from "./typeguards";

export const markupId = (r: Table.MarkupRowId): number => parseInt(r.split("markup-")[1]);
export const groupId = (r: Table.GroupRowId): number => parseInt(r.split("group-")[1]);
export const httpId = (r: Table.HttpEditableRowId): number => (typeguards.isMarkupRowId(r) ? markupId(r) : r);

export const mergeChangesWithRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  id: Table.RowId,
  row: Table.EditableRow<R, M>,
  changes: Table.DataChangePayload<R, M>
): Table.EditableRow<R, M> => {
  const consolidated: Table.ConsolidatedChange<R, M> = events.consolidateTableChange<R, M>(changes);
  return {
    ...row,
    data: reduce(
      consolidated,
      (curr: R, change: Table.RowChange<R, M>) => {
        if (change.id !== id) {
          /* eslint-disable no-console */
          console.error("Cannot apply table changes from one row to another row!");
          return curr;
        } else {
          let field: keyof R;
          for (field in change.data) {
            const cellChange = util.getKeyValue<Table.RowChangeData<R>, keyof R>(field)(
              change.data
            ) as Table.CellChange<R>;
            curr = { ...curr, [field as string]: cellChange.newValue };
          }
          return curr;
        }
      },
      { ...row.data }
    )
  };
};

export const createRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Table.CreateRowDataConfig<R, M>
): R => {
  const readColumns = filter(
    config.columns,
    (c: Table.AnyColumn<R, M>) => !typeguards.isAgColumn(c) || c.isRead !== false
  );
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  return reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      if (!isNil(col.field)) {
        const value = config.getValue(col.field, col);
        if (value === undefined) {
          return { ...obj, [col.field]: nullValue };
        }
        return { ...obj, [col.field]: value };
      }
      return obj;
    },
    {} as R
  );
};

export const updateRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Table.UpdateRowDataConfig<R, M>
): R => {
  const readColumns = filter(
    config.columns,
    (c: Table.AnyColumn<R, M>) => !typeguards.isAgColumn(c) || c.isRead !== false
  );
  const defaultNullValue = config.defaultNullValue === undefined ? null : config.defaultNullValue;
  const merged: R = {
    ...config.data,
    ...config.update
  };
  return reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      const nullValue = col.nullValue === undefined ? defaultNullValue : col.nullValue;
      if (!isNil(col.field)) {
        const value = config.getValue(col.field, merged[col.field], col);
        if (value === undefined) {
          return { ...obj, [col.field]: nullValue };
        }
        return { ...obj, [col.field]: value };
      }
      return obj;
    },
    merged as R
  );
};

/* eslint-disable indent */
export const createRow = <
  RId extends Table.RowId,
  TP extends Table.RowType,
  R extends Table.RowData,
  M extends Model.HttpModel,
  Grid extends Table.GridId = Table.GridId
>(
  config: Table.CreateRowConfig<RId, TP, R, M, Grid>
): Table.IRow<RId, TP, R, Grid> => {
  return {
    id: config.id,
    data: config.data,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const updateGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.UpdateRowDataConfig<R, M>, "getValue"> & {
    readonly childrenRows: Table.NonGroupRow<R, M>[];
  }
): R =>
  updateRowData({
    ...config,
    getValue: (field: keyof R, curr: R[keyof R], col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getGroupValue) && typeof col.getGroupValue === "function") {
        return col.getGroupValue(config.childrenRows);
      }
      return curr;
    }
  });

export const createGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.CreateRowDataConfig<R, M>, "getValue"> & {
    readonly group: Model.Group;
    readonly childrenRows: Table.NonGroupRow<R, M>[];
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getGroupValue)) {
        if (typeof col.getGroupValue === "string") {
          return config.group[col.getGroupValue] as unknown as R[keyof R] | undefined;
        } else {
          return col.getGroupValue(config.childrenRows);
        }
      }
    }
  });

export const createGroupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<
    Table.CreateRowConfig<Table.GroupRowId, "group", R, M>,
    "gridId" | "rowType" | "id" | "callbackArgs" | "data"
  > & {
    readonly group: Model.Group;
    readonly childrenRows: Table.GroupableRow<R, M>[];
  }
): Table.GroupRow<R> => {
  return {
    ...createRow<Table.GroupRowId, "group", R, M, "data">({
      ...config,
      id: `group-${config.group.id}`,
      rowType: "group",
      gridId: "data",
      data: createGroupRowData(config)
    }),
    children: config.group.children,
    children_markups: config.group.children_markups,
    groupData: {
      color: config.group.color,
      name: config.group.name
    }
  };
};

export const updateMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.UpdateRowDataConfig<R, M>, "getValue"> & {
    readonly childrenRows: Table.NonGroupRow<R, M>[];
  }
): R =>
  updateRowData({
    ...config,
    getValue: (field: keyof R, curr: R[keyof R], col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getMarkupValue) && typeof col.getMarkupValue === "function") {
        return col.getMarkupValue(config.childrenRows);
      }
      return curr;
    }
  });

export const createMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.CreateRowDataConfig<R, M>, "getValue"> & {
    readonly markup: Model.Markup;
    readonly childrenRows: Table.NonGroupRow<R, M>[];
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getMarkupValue)) {
        if (typeof col.getMarkupValue === "string") {
          return config.markup[col.getMarkupValue] as unknown as R[keyof R] | undefined;
        } else {
          return col.getMarkupValue(config.childrenRows);
        }
      }
    }
  });

export const createMarkupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<
    Table.CreateRowConfig<Table.MarkupRowId, "markup", R, M>,
    "gridId" | "rowType" | "id" | "callbackArgs" | "data"
  > & {
    readonly markup: Model.Markup;
    readonly childrenRows: Table.NonGroupRow<R, M>[];
  }
): Table.MarkupRow<R> => {
  return {
    ...createRow<Table.MarkupRowId, "markup", R, M, "data">({
      ...config,
      id: `markup-${config.markup.id}`,
      rowType: "markup",
      gridId: "data",
      data: createMarkupRowData(config)
    }),
    children: config.markup.children,
    // groups: config.markup.groups,
    markupData: {
      unit: config.markup.unit,
      rate: config.markup.rate
    }
  };
};

export const createPlaceholderRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.CreateRowDataConfig<R, M>, "getValue"> & {
    readonly data: R;
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      return config.data[field];
    }
  });

export const createPlaceholderRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<
    Table.CreateRowConfig<Table.PlaceholderRowId, "placeholder", R, M>,
    "gridId" | "rowType" | "id" | "callbackArgs" | "data"
  > & {
    readonly id: Table.PlaceholderRowId;
    readonly data: R;
  }
): Table.PlaceholderRow<R> => {
  return {
    ...createRow<Table.PlaceholderRowId, "placeholder", R, M, "data">({
      ...config,
      id: config.id,
      rowType: "placeholder",
      gridId: "data",
      data: createPlaceholderRowData(config)
    })
  };
};

export const createModelRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.CreateRowDataConfig<R, M>, "getValue"> & {
    readonly model: M;
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      return !isNil(col.getRowValue)
        ? col.getRowValue(config.model)
        : (util.getKeyValue<M, keyof M>(field as keyof M)(config.model) as unknown as R[keyof R]);
    }
  });

export const createModelRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<Table.CreateRowConfig<Table.ModelRowId, "model", R, M>, "rowType" | "id" | "callbackArgs" | "data"> & {
    readonly model: M;
    readonly getRowChildren?: (m: M) => number[];
  }
): Table.ModelRow<R, M> => {
  return {
    children: !isNil(config.getRowChildren) ? config.getRowChildren(config.model) : [],
    modelData: config.model,
    ...createRow<Table.ModelRowId, "model", R, M>({
      ...config,
      id: config.model.id,
      rowType: "model",
      gridId: config.gridId,
      data: createModelRowData(config)
    })
  };
};
