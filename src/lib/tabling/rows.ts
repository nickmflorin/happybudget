import { isNil, reduce, filter } from "lodash";

import * as util from "../util";
import * as events from "./events";
import * as typeguards from "./typeguards";

type CreateRowDataConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
  readonly columns: Table.AnyColumn<R, M>[];
  readonly getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => R[keyof R] | undefined;
};

type UpdateRowDataConfig<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  MM extends Model.HttpModel = M
> = {
  readonly columns: Table.AnyColumn<R, M>[];
  readonly data: R;
  readonly model?: Partial<MM>;
  readonly getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => R[keyof R] | undefined;
};

type UpdateRowConfig<
  RW extends Table.Row<R>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  MM extends Model.HttpModel = M
> = Omit<UpdateRowDataConfig<R, M>, "getValue" | "data" | "model"> & {
  readonly row: RW;
  readonly model?: Partial<MM>;
};

type CreateRowConfig<
  RId extends Table.RowId,
  TP extends Table.RowType,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  Grid extends Table.GridId = Table.GridId
> = Omit<CreateRowDataConfig<R, M>, "getValue" | "model"> & {
  readonly id: RId;
  readonly rowType: TP;
  readonly data: R;
  readonly gridId: Grid;
};

type CreateRowFromModelConfig<
  RId extends Table.RowId,
  TP extends Table.RowType,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  MM extends Model.HttpModel = M,
  Grid extends Table.GridId = Table.GridId
> = Omit<CreateRowConfig<RId, TP, R, M, Grid>, "data"> & {
  readonly model: MM;
};

export const markupRowId = (r: number): Table.MarkupRowId => `markup-${r}`;
export const markupId = (r: Table.MarkupRowId): number => parseInt(r.split("markup-")[1]);

export const groupRowId = (r: number): Table.GroupRowId => `group-${r}`;
export const groupId = (r: Table.GroupRowId): number => parseInt(r.split("group-")[1]);

export const placeholderRowId = (): Table.PlaceholderRowId => `placeholder-${util.generateRandomNumericId()}`;

export const safeEditableRowId = (r: Table.EditableRowId): Table.EditableRowId =>
  typeguards.isMarkupRowId(r) ? r : parseInt(String(r));
export const editableId = (r: Table.EditableRowId): number =>
  typeguards.isMarkupRowId(r) ? markupId(r) : parseInt(String(r));

export const mergeChangesWithRow = <R extends Table.RowData>(
  id: Table.RowId,
  row: Table.EditableRow<R>,
  changes: Table.DataChangePayload<R>
): Table.EditableRow<R> => {
  const consolidated: Table.ConsolidatedChange<R> = events.consolidateRowChanges<R>(changes);
  return {
    ...row,
    data: reduce(
      consolidated,
      (curr: R, change: Table.RowChange<R>) => {
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
  config: CreateRowDataConfig<R, M>
): R => {
  const readColumns = filter(
    config.columns,
    (c: Table.AnyColumn<R, M>) => !typeguards.isAgColumn(c) || c.isRead !== false
  );
  return reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.field)) {
        const value = config.getValue(col.field, col);
        if (value === undefined) {
          const nullValue = col.nullValue === undefined ? null : col.nullValue;
          return { ...obj, [col.field]: nullValue };
        }
        return { ...obj, [col.field]: value };
      }
      return obj;
    },
    {} as R
  );
};

export const updateRowData = <R extends Table.RowData, M extends Model.HttpModel, MM extends Model.HttpModel = M>(
  config: UpdateRowDataConfig<R, M, MM>
): R => {
  const readColumns = filter(
    config.columns,
    (c: Table.AnyColumn<R, M>) => !typeguards.isAgColumn(c) || c.isRead !== false
  );
  return reduce(
    readColumns,
    (obj: R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.field)) {
        const value = config.getValue(col.field, col);
        // When updating the row data, if the value is undefined then we simply
        // do not update it.
        if (value === undefined) {
          return obj;
        }
        return { ...obj, [col.field]: value };
      }
      return obj;
    },
    config.data
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
  config: CreateRowConfig<RId, TP, R, M, Grid>
): Table.IRow<RId, TP, R, Grid> => {
  return {
    id: config.id,
    data: config.data,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const updateGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<UpdateRowDataConfig<R, M, Model.Group>, "getValue"> & {
    readonly childrenRows?: Table.ModelRow<R>[];
  }
): R =>
  updateRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getGroupValue)) {
        if (typeof col.getGroupValue === "string") {
          if (!isNil(config.model)) {
            return config.model[col.getGroupValue] as unknown as R[keyof R];
          }
        } else {
          if (!isNil(config.childrenRows)) {
            return col.getGroupValue(config.childrenRows);
          }
        }
      }
    }
  });

export const createGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateRowDataConfig<R, M>, "getValue"> & {
    readonly childrenRows: Table.ModelRow<R>[];
    readonly model: Model.Group;
  }
): R =>
  createRowData<R, M>({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getGroupValue)) {
        if (typeof col.getGroupValue === "string") {
          return config.model[col.getGroupValue] as unknown as R[keyof R];
        } else {
          return col.getGroupValue(config.childrenRows);
        }
      }
      return (col.nullValue === undefined ? null : col.nullValue) as R[keyof R];
    }
  });

export const updateGroupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: UpdateRowConfig<Table.GroupRow<R>, R, M, Model.Group> & {
    readonly childrenRows?: Table.ModelRow<R>[];
  }
): Table.GroupRow<R> => {
  return {
    ...config.row,
    data: updateGroupRowData({ ...config, data: config.row.data }),
    children: config.model?.children || config.row.children,
    groupData: {
      name: config.model?.name === undefined ? config.row.groupData.name : config.model.name,
      color: config.model?.color === undefined ? config.row.groupData.color : config.model.color
    }
  };
};

export const createGroupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateRowFromModelConfig<Table.GroupRowId, "group", R, M, Model.Group>, "gridId" | "rowType" | "id"> & {
    readonly childrenRows: Table.ModelRow<R>[];
  }
): Table.GroupRow<R> => {
  return {
    ...createRow<Table.GroupRowId, "group", R, M, "data">({
      ...config,
      id: groupRowId(config.model.id),
      rowType: "group",
      gridId: "data",
      data: createGroupRowData<R, M>(config)
    }),
    children: config.model.children,
    groupData: {
      color: config.model.color,
      name: config.model.name
    }
  };
};

export const updateMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<UpdateRowDataConfig<R, M, Model.Markup>, "getValue"> & {
    readonly childrenRows?: Table.ModelRow<R>[];
  }
): R =>
  updateRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getMarkupValue)) {
        if (typeof col.getMarkupValue === "string") {
          if (!isNil(config.model)) {
            return config.model[col.getMarkupValue] as unknown as R[keyof R];
          }
        } else {
          if (!isNil(config.childrenRows)) {
            return col.getMarkupValue(config.childrenRows);
          }
        }
      }
    }
  });

export const createMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateRowDataConfig<R, M>, "getValue"> & {
    readonly childrenRows: Table.ModelRow<R>[];
    readonly model: Model.Markup;
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      if (!isNil(col.getMarkupValue)) {
        if (typeof col.getMarkupValue === "string") {
          return config.model[col.getMarkupValue] as unknown as R[keyof R];
        } else {
          return col.getMarkupValue(config.childrenRows);
        }
      }
      return (col.nullValue === undefined ? null : col.nullValue) as R[keyof R];
    }
  });

export const updateMarkupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: UpdateRowConfig<Table.MarkupRow<R>, R, M, Model.Markup> & {
    readonly childrenRows?: Table.ModelRow<R>[];
  }
): Table.MarkupRow<R> => {
  return {
    ...config.row,
    data: updateMarkupRowData({ ...config, data: config.row.data }),
    children: config.model?.children || config.row.children,
    markupData: {
      unit: config.model?.unit === undefined ? config.row.markupData.unit : config.model.unit,
      rate: config.model?.rate === undefined ? config.row.markupData.rate : config.model.rate
    }
  };
};

export const createMarkupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<
    CreateRowFromModelConfig<Table.MarkupRowId, "markup", R, M, Model.Markup>,
    "gridId" | "rowType" | "id"
  > & {
    readonly childrenRows: Table.ModelRow<R>[];
  }
): Table.MarkupRow<R> => {
  return {
    ...createRow<Table.MarkupRowId, "markup", R, M, "data">({
      ...config,
      id: markupRowId(config.model.id),
      rowType: "markup",
      gridId: "data",
      data: createMarkupRowData(config)
    }),
    children: config.model.children,
    markupData: {
      unit: config.model.unit,
      rate: config.model.rate
    }
  };
};

export const createPlaceholderRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateRowDataConfig<R, M>, "getValue" | "model"> & {
    readonly data?: Partial<R>;
  }
): R =>
  createRowData({
    ...config,
    getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => {
      return !isNil(config.data) ? config.data[field] : undefined;
    }
  });

export const createPlaceholderRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateRowConfig<Table.PlaceholderRowId, "placeholder", R, M>, "gridId" | "rowType" | "data"> & {
    readonly data?: Partial<R>;
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
  config: Omit<CreateRowDataConfig<R, M>, "getValue"> & {
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
  config: Omit<CreateRowFromModelConfig<Table.ModelRowId, "model", R, M>, "gridId" | "rowType" | "id"> & {
    readonly getRowChildren?: (m: M) => number[];
  }
): Table.ModelRow<R> => {
  return {
    children: !isNil(config.getRowChildren) ? config.getRowChildren(config.model) : [],
    ...createRow<Table.ModelRowId, "model", R, M, "data">({
      ...config,
      id: config.model.id,
      rowType: "model",
      gridId: "data",
      data: createModelRowData(config)
    })
  };
};
