import { isNil, reduce, filter } from "lodash";
import { model } from "lib";

import * as util from "../util";
import * as events from "./events";
import * as typeguards from "./typeguards";

type CreateBodyRowDataConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
  readonly columns?: Table.Column<R, M>[];
  readonly getValue: (field: keyof R, col: Table.Column<R, M>) => R[keyof R] | undefined;
};

type UpdateBodyRowDataConfig<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  MM extends Model.HttpModel = M
> = {
  readonly columns?: Table.Column<R, M>[];
  readonly data: R;
  readonly model?: Partial<MM>;
  readonly getValue: (field: keyof R, col: Table.Column<R, M>) => R[keyof R] | undefined;
};

type UpdateBodyRowConfig<
  RW extends Table.BodyRow<R>,
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  MM extends Model.HttpModel = M
> = Omit<UpdateBodyRowDataConfig<R, M>, "getValue" | "data" | "model"> & {
  readonly row: RW;
  readonly model?: Partial<MM>;
};

type CreateRowConfig<RId extends Table.RowId, TP extends Table.RowType, Grid extends Table.GridId = Table.GridId> = {
  readonly id: RId;
  readonly rowType: TP;
  readonly gridId: Grid;
};

export const markupRowId = (r: number): Table.MarkupRowId => `markup-${r}`;
export const markupId = (r: Table.MarkupRowId): number => parseInt(r.split("markup-")[1]);

export const groupRowId = (r: number): Table.GroupRowId => `group-${r}`;
export const groupId = (r: Table.GroupRowId): number => parseInt(r.split("group-")[1]);

export const placeholderRowId = (): Table.PlaceholderRowId => `placeholder-${util.generateRandomNumericId()}`;
export const footerRowId = (gridId: Table.FooterGridId): Table.FooterRowId => `footer-${gridId}`;

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

/* eslint-disable indent */
export const createBodyRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: CreateBodyRowDataConfig<R, M>
): R => {
  return reduce(
    filter(config.columns, (c: Table.Column<R, M>) => c.isRead !== false),
    (obj: R, c: Table.Column<R, M>) => {
      if (!isNil(c.field)) {
        const nullValue = c.nullValue === undefined ? null : c.nullValue;
        const value = config.getValue(c.field, c);
        if (value === undefined) {
          return { ...obj, [c.field]: nullValue };
        }
        return { ...obj, [c.field]: value };
      }
      return obj;
    },
    {} as R
  );
};

export const updateBodyRowData = <R extends Table.RowData, M extends Model.HttpModel, MM extends Model.HttpModel = M>(
  config: UpdateBodyRowDataConfig<R, M, MM>
): R => {
  const readColumns = filter(config.columns, (c: Table.Column<R, M>) => c.isRead !== false);
  return reduce(
    readColumns,
    (obj: R, col: Table.Column<R, M>) => {
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
export const createRow = <RId extends Table.RowId, TP extends Table.RowType, Grid extends Table.GridId = Table.GridId>(
  config: CreateRowConfig<RId, TP, Grid>
): Table.IRow<RId, TP, Grid> => {
  return {
    id: config.id,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const createFooterRow = <Grid extends Table.FooterGridId = Table.FooterGridId>(
  config: Omit<CreateRowConfig<Table.FooterRowId, "footer", Grid>, "id" | "rowType">
): Table.FooterRow => createRow({ ...config, rowType: "footer", id: footerRowId(config.gridId) });

type CreateBodyRowFromDataConfig<
  RId extends Table.RowId,
  TP extends Table.RowType,
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel
> = Omit<CreateRowConfig<RId, TP, "data">, "gridId"> &
  Omit<CreateBodyRowDataConfig<R, M>, "getValue" | "model"> & {
    readonly data: R;
  };

type CreateBodyRowFromModelConfig<
  RId extends Table.RowId,
  TP extends Table.RowType,
  R extends Table.RowData,
  M extends Model.TypedHttpModel = Model.TypedHttpModel,
  MM extends Model.TypedHttpModel = M
> = Omit<CreateRowConfig<RId, TP, "data">, "gridId"> &
  Omit<CreateBodyRowDataConfig<R, M>, "getValue" | "model"> & {
    readonly model: MM;
  };

export const createBodyRow = <
  RId extends Table.BodyRowId,
  TP extends Table.BodyRowType,
  R extends Table.RowData,
  M extends Model.TypedHttpModel
>(
  config: CreateBodyRowFromDataConfig<RId, TP, R, M>
): Table.IBodyRow<RId, TP, R> => {
  return {
    ...createRow({ ...config, gridId: "data" }),
    data: config.data
  };
};

export const updateGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<UpdateBodyRowDataConfig<R, M, Model.Group>, "getValue">
): R =>
  updateBodyRowData<R, M, Model.Group>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) =>
      !isNil(config.model)
        ? (util.getKeyValue<Partial<Model.Group>, keyof Model.Group>(field as keyof Model.Group)(
            config.model
          ) as unknown as R[keyof R])
        : undefined
  });

export const createGroupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateBodyRowDataConfig<R, M>, "getValue"> & {
    readonly model: Model.Group;
  }
): R =>
  createBodyRowData<R, M>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) =>
      util.getKeyValue<Partial<Model.Group>, keyof Model.Group>(field as keyof Model.Group)(
        config.model
      ) as unknown as R[keyof R]
  });

export const updateGroupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: UpdateBodyRowConfig<Table.GroupRow<R>, R, M, Model.Group>
): Table.GroupRow<R> => {
  return {
    ...config.row,
    data: updateGroupRowData<R, M>({ ...config, data: config.row.data }),
    children: config.model?.children || config.row.children,
    groupData: {
      name: config.model?.name === undefined ? config.row.groupData.name : config.model.name,
      color: config.model?.color === undefined ? config.row.groupData.color : config.model.color
    }
  };
};

type CreateGroupRowFromModelConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromModelConfig<Table.GroupRowId, "group", R, M, Model.Group>,
  "rowType" | "id"
> & {
  readonly getRowChildren?: (m: M) => number[];
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
};

type CreateGroupRowFromDataConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromDataConfig<Table.GroupRowId, "group", R, M>,
  "rowType"
> & {
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
  readonly children?: number[];
  readonly name: string;
  readonly color: Style.HexColor | null;
};

const isGroupRowConfigWithModel = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateGroupRowFromModelConfig<R, M> | CreateGroupRowFromDataConfig<R, M>
): config is CreateGroupRowFromModelConfig<R, M> => (config as CreateGroupRowFromModelConfig<R, M>).model !== undefined;

export const createGroupRow = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateGroupRowFromModelConfig<R, M> | CreateGroupRowFromDataConfig<R, M>
): Table.GroupRow<R> => {
  if (isGroupRowConfigWithModel(config)) {
    return {
      ...createBodyRow<Table.GroupRowId, "group", R, M>({
        ...config,
        id: groupRowId(config.model.id),
        rowType: "group",
        data: createGroupRowData<R, M>(config)
      }),
      children: config.model.children,
      groupData: {
        color: config.model.color,
        name: config.model.name
      }
    };
  }
  return {
    ...createBodyRow<Table.GroupRowId, "group", R, M>({
      ...config,
      id: config.id,
      rowType: "group",
      data: config.data
    }),
    children: config.children || [],
    groupData: {
      color: config.color,
      name: config.name
    }
  };
};

export const updateMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<UpdateBodyRowDataConfig<R, M, Model.Markup>, "getValue">
): R =>
  updateBodyRowData<R, M, Model.Markup>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) =>
      !isNil(config.model)
        ? (util.getKeyValue<Partial<Model.Markup>, keyof Model.Markup>(field as keyof Model.Markup)(
            config.model
          ) as unknown as R[keyof R])
        : undefined
  });

export const createMarkupRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateBodyRowDataConfig<R, M>, "getValue"> & {
    readonly model: Model.Markup;
  }
): R =>
  createBodyRowData<R, M>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) =>
      util.getKeyValue<Model.Markup, keyof Model.Markup>(field as keyof Model.Markup)(
        config.model
      ) as unknown as R[keyof R]
  });

export const updateMarkupRow = <R extends Table.RowData, M extends Model.HttpModel>(
  config: UpdateBodyRowConfig<Table.MarkupRow<R>, R, M, Model.Markup>
): Table.MarkupRow<R> => {
  let modelChildren: number[] | undefined;
  if (!isNil(config.model) && !isNil(config.model.unit)) {
    const mdl = config.model as Omit<Partial<Model.Markup>, "unit"> & Pick<Model.Markup, "unit">;
    modelChildren = model.typeguards.isPercentMarkup(mdl) ? mdl.children : [];
  }
  return {
    ...config.row,
    data: updateMarkupRowData<R, M>({ ...config, data: config.row.data }),
    children: modelChildren === undefined ? config.row.children : modelChildren,
    markupData: {
      unit: config.model?.unit === undefined ? config.row.markupData.unit : config.model.unit,
      rate: config.model?.rate === undefined ? config.row.markupData.rate : config.model.rate
    }
  };
};

type CreateMarkupRowFromModelConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromModelConfig<Table.MarkupRowId, "markup", R, M, Model.Markup>,
  "rowType" | "id"
> & {
  readonly getRowChildren?: (m: M) => number[];
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
};

type CreateMarkupRowFromDataConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromDataConfig<Table.MarkupRowId, "markup", R, M>,
  "rowType"
> & {
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
  readonly children?: number[];
  readonly unit: Model.MarkupUnit;
  readonly rate: number | null;
};

const isMarkupRowConfigWithModel = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateMarkupRowFromModelConfig<R, M> | CreateMarkupRowFromDataConfig<R, M>
): config is CreateMarkupRowFromModelConfig<R, M> =>
  (config as CreateMarkupRowFromModelConfig<R, M>).model !== undefined;

export const createMarkupRow = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateMarkupRowFromModelConfig<R, M> | CreateMarkupRowFromDataConfig<R, M>
): Table.MarkupRow<R> => {
  if (isMarkupRowConfigWithModel(config)) {
    return {
      ...createBodyRow<Table.MarkupRowId, "markup", R, M>({
        ...config,
        id: markupRowId(config.model.id),
        rowType: "markup",
        data: createMarkupRowData<R, M>(config)
      }),
      children: model.typeguards.isPercentMarkup(config.model) ? config.model.children : [],
      markupData: {
        unit: config.model.unit,
        rate: config.model.rate
      }
    };
  }
  return {
    ...createBodyRow<Table.MarkupRowId, "markup", R, M>({
      ...config,
      id: config.id,
      rowType: "markup",
      data: config.data
    }),
    children: config.children || [],
    markupData: {
      unit: config.unit,
      rate: config.rate
    }
  };
};

export const createPlaceholderRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateBodyRowDataConfig<R, M>, "getValue" | "model"> & {
    readonly data?: Partial<R>;
  }
): R =>
  createBodyRowData<R, M>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) => {
      return !isNil(config.data) ? config.data[field] : undefined;
    }
  });

export const createPlaceholderRow = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: Omit<CreateBodyRowFromDataConfig<Table.PlaceholderRowId, "placeholder", R, M>, "rowType" | "data"> & {
    readonly data?: Partial<R>;
    readonly originalIndex: number;
  }
): Table.PlaceholderRow<R> => {
  return {
    originalIndex: config.originalIndex,
    ...createBodyRow<Table.PlaceholderRowId, "placeholder", R, M>({
      ...config,
      id: config.id,
      rowType: "placeholder",
      data: createPlaceholderRowData(config)
    })
  };
};

export const createModelRowData = <R extends Table.RowData, M extends Model.HttpModel>(
  config: Omit<CreateBodyRowDataConfig<R, M>, "getValue"> & {
    readonly model: M;
    readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
  }
): R =>
  createBodyRowData<R, M>({
    ...config,
    getValue: (field: keyof R, col: Table.Column<R, M>) => {
      let value: R[keyof R] | undefined = undefined;
      if (!isNil(col.getRowValue)) {
        value = col.getRowValue(config.model);
      } else if (!isNil(config.getRowValue)) {
        value = config.getRowValue(config.model, col);
      }
      if (value === undefined) {
        value = util.getKeyValue<M, keyof M>(field as keyof M)(config.model) as unknown as R[keyof R];
      }
      return value;
    }
  });

type CreateModelRowFromModelConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromModelConfig<Table.ModelRowId, "model", R, M, M>,
  "rowType" | "id"
> & {
  readonly originalIndex: number;
  readonly getRowChildren?: (m: M) => number[];
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
};

type CreateModelRowFromDataConfig<R extends Table.RowData, M extends Model.TypedHttpModel> = Omit<
  CreateBodyRowFromDataConfig<Table.ModelRowId, "model", R, M>,
  "rowType"
> & {
  readonly originalIndex: number;
  readonly getRowValue?: (m: M, col: Table.Column<R, M>) => R[keyof R] | undefined;
  readonly children?: number[];
};

const isModelRowConfigWithModel = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateModelRowFromModelConfig<R, M> | CreateModelRowFromDataConfig<R, M>
): config is CreateModelRowFromModelConfig<R, M> => (config as CreateModelRowFromModelConfig<R, M>).model !== undefined;

export const createModelRow = <R extends Table.RowData, M extends Model.TypedHttpModel>(
  config: CreateModelRowFromModelConfig<R, M> | CreateModelRowFromDataConfig<R, M>
): Table.ModelRow<R> => {
  if (isModelRowConfigWithModel(config)) {
    return {
      originalIndex: config.originalIndex,
      children: !isNil(config.getRowChildren) ? config.getRowChildren(config.model) : [],
      ...createBodyRow<Table.ModelRowId, "model", R, M>({
        ...config,
        id: config.model.id,
        rowType: "model",
        data: createModelRowData<R, M>(config)
      })
    };
  }
  return {
    originalIndex: config.originalIndex,
    children: config.children || [],
    ...createBodyRow<Table.ModelRowId, "model", R, M>({
      ...config,
      id: config.id,
      rowType: "model",
      data: config.data
    })
  };
};
