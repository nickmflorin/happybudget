import { reduce, filter, isNil, includes } from "lodash";
import { util, budgeting } from "lib";

import * as typeguards from "./typeguards";

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

type CreateRowConfig<RId extends Table.RowId> = {
  readonly id: RId;
};

type RowManagerConfig<TP extends Table.RowType, Grid extends Table.GridId = Table.GridId> = {
  readonly rowType: TP;
  readonly gridId: Grid;
};

abstract class RowManager<RId extends Table.RowId, TP extends Table.RowType, Grid extends Table.GridId = Table.GridId> {
  public rowType: TP;
  public gridId: Grid;

  constructor(config: RowManagerConfig<TP, Grid>) {
    this.rowType = config.rowType;
    this.gridId = config.gridId;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public createBasic(config: CreateRowConfig<RId>): Table.IRow<RId, TP, Grid> {
    return {
      id: config.id,
      rowType: this.rowType,
      gridId: this.gridId
    };
  }
}

export const createRow = <RId extends Table.RowId, TP extends Table.RowType, Grid extends Table.GridId = Table.GridId>(
  config: RowManagerConfig<TP, Grid> & CreateRowConfig<RId>
): Table.IRow<RId, TP, Grid> => {
  return {
    id: config.id,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const createFooterRow = <Grid extends Table.FooterGridId = Table.FooterGridId>(
  config: Omit<RowManagerConfig<"footer", Grid>, "rowType">
): Table.FooterRow => createRow({ ...config, rowType: "footer", id: footerRowId(config.gridId) });

type CreateBodyRowConfig<RId extends Table.BodyRowId, R extends Table.RowData> = CreateRowConfig<RId> & {
  readonly data?: R;
};

type BodyRowManagerConfig<
  TP extends Table.BodyRowType,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<RowManagerConfig<TP, "data">, "gridId"> & {
  readonly columns: Table.Column<R, M>[];
};

abstract class BodyRowManager<
  RId extends Table.BodyRowId,
  TP extends Table.BodyRowType,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> extends RowManager<RId, TP, "data"> {
  public columns: Table.Column<R, M>[];

  constructor(config: BodyRowManagerConfig<TP, R, M>) {
    super({ ...config, gridId: "data" });
    this.columns = config.columns;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  abstract getValueForRow(field: keyof R, col: Table.Column<R, M>, ...args: any[]): R[keyof R] | undefined;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  createData(...args: any[]): R {
    return reduce(
      filter(this.columns, (c: Table.Column<R, M>) => c.isRead !== false),
      (obj: R, c: Table.Column<R, M>) => {
        if (!isNil(c.field)) {
          const nullValue = c.nullValue === undefined ? null : c.nullValue;
          const value = this.getValueForRow(c.field, c, ...args);
          if (value === undefined) {
            return { ...obj, [c.field]: nullValue };
          }
          return { ...obj, [c.field]: value };
        }
        return obj;
      },
      {} as R
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public createBasic(config: CreateBodyRowConfig<RId, R>, ...args: any[]): Table.IBodyRow<RId, TP, R> {
    return {
      ...super.createBasic(config),
      data: config.data || this.createData(...args)
    };
  }
}

type CreatePlaceholderRowConfig<R extends Table.RowData> = {
  readonly id: Table.PlaceholderRowId;
  readonly data?: Partial<R>;
};

type PlaceholderRowConfig<R extends Table.RowData, M extends Model.RowHttpModel> = Omit<
  BodyRowManagerConfig<"placeholder", R, M>,
  "rowType"
> & {
  readonly defaultData?: Partial<R>;
};

export class PlaceholderRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.PlaceholderRowId, "placeholder", R, M> {
  public getRowChildren: ((m: M) => number[]) | undefined;
  public defaultData?: Partial<R>;

  constructor(config: PlaceholderRowConfig<R, M>) {
    super({ ...config, rowType: "placeholder" });
    this.defaultData = config.defaultData;
  }

  getValueForRow(field: keyof R, col: Table.Column<R, M>, data?: Partial<R>) {
    const value = this.defaultData === undefined ? undefined : this.defaultData[field];
    if (value === undefined) {
      return data === undefined ? undefined : data[field];
    }
    return value;
  }

  create(config: CreatePlaceholderRowConfig<R>): Table.PlaceholderRow<R> {
    return {
      children: [],
      ...this.createBasic({ id: config.id }, config.data)
    };
  }
}

type GetRowValue<R extends Table.RowData, M extends Model.RowHttpModel> = (
  m: M,
  col: Table.Column<R, M>
) => R[keyof R] | undefined;

type CreateModelRowFromModelConfig<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly model: M;
  // Used solely for PDF purposes.
  readonly getRowValue?: GetRowValue<R, M> | undefined;
};

type CreateModelRowFromDataConfig<R extends Table.RowData> = {
  readonly id: Table.ModelRowId;
  readonly data: R;
  readonly order: string;
  readonly children: number[];
};

type CreateModelRowConfig<R extends Table.RowData, M extends Model.RowHttpModel> =
  | CreateModelRowFromModelConfig<R, M>
  | CreateModelRowFromDataConfig<R>;

const isModelRowConfigWithModel = <R extends Table.RowData, M extends Model.RowHttpModel>(
  config: CreateModelRowConfig<R, M>
): config is CreateModelRowFromModelConfig<R, M> => (config as CreateModelRowFromModelConfig<R, M>).model !== undefined;

type ModelRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
  readonly getRowChildren?: (m: M) => number[];
};

export class ModelRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.ModelRowId, "model", R, M> {
  public getRowChildren: ((m: M) => number[]) | undefined;

  constructor(config: ModelRowManagerConfig<R, M>) {
    super({ ...config, rowType: "model" });
    this.getRowChildren = config.getRowChildren;
  }

  getValueForRow(field: keyof R, col: Table.Column<R, M>, m: M, getRowValue?: GetRowValue<R, M>) {
    let value: R[keyof R] | undefined = undefined;
    if (!isNil(getRowValue)) {
      value = getRowValue(m, col);
    } else if (!isNil(col.getRowValue)) {
      value = col.getRowValue(m);
    }
    if (value === undefined) {
      value = util.getKeyValue<M, keyof M>(field as keyof M)(m) as unknown as R[keyof R];
    }
    return value;
  }

  create(config: CreateModelRowConfig<R, M>): Table.ModelRow<R> {
    if (isModelRowConfigWithModel(config)) {
      return {
        order: config.model.order,
        children: this.getRowChildren?.(config.model) || [],
        ...this.createBasic(
          {
            ...config,
            id: config.model.id
          },
          config.model,
          config.getRowValue
        )
      };
    }
    return {
      order: config.order,
      children: config.children,
      ...this.createBasic({
        ...config,
        id: config.id,
        data: config.data
      })
    };
  }
}

type CreateMarkupRowFromModelConfig = {
  readonly model: Model.Markup;
};

type CreateMarkupRowFromDataConfig<R extends Table.RowData> = {
  readonly id: Table.MarkupRowId;
  readonly data: R;
  readonly children?: number[];
  readonly unit: Model.Markup["unit"];
  readonly rate: Model.Markup["rate"];
};

type CreateMarkupRowConfig<R extends Table.RowData> = CreateMarkupRowFromModelConfig | CreateMarkupRowFromDataConfig<R>;

const isMarkupRowConfigWithModel = <R extends Table.RowData>(
  config: CreateMarkupRowConfig<R>
): config is CreateMarkupRowFromModelConfig => (config as CreateMarkupRowFromModelConfig).model !== undefined;

type MarkupRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
};

export class MarkupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.MarkupRowId, "markup", R, M> {
  constructor(config: MarkupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "markup" });
  }

  getValueForRow(field: keyof R, col: Table.Column<R, M>, markup: Model.Markup) {
    return util.getKeyValue<Model.Markup, keyof Model.Markup>(field as keyof Model.Markup)(
      markup
    ) as unknown as R[keyof R];
  }

  removeChildren(row: Table.MarkupRow<R>, ids: SingleOrArray<number>): Table.MarkupRow<R> {
    const IDs: number[] = Array.isArray(ids) ? ids : [ids];
    return this.create({
      unit: row.markupData.unit,
      rate: row.markupData.rate,
      id: row.id,
      children: filter(row.children, (child: number) => !includes(IDs, child)),
      data: row.data
    });
  }

  create(config: CreateMarkupRowConfig<R>): Table.MarkupRow<R> {
    if (isMarkupRowConfigWithModel(config)) {
      return {
        ...this.createBasic(
          {
            ...config,
            id: markupRowId(config.model.id)
          },
          config.model
        ),
        children: budgeting.typeguards.isPercentMarkup(config.model) ? config.model.children : [],
        markupData: {
          unit: config.model.unit,
          rate: config.model.rate
        }
      };
    }
    return {
      ...this.createBasic({
        ...config,
        id: config.id,
        data: config.data
      }),
      children: config.children || [],
      markupData: {
        unit: config.unit,
        rate: config.rate
      }
    };
  }
}

type CreateGroupRowFromModelConfig = {
  readonly model: Model.Group;
};

type CreateGroupRowFromDataConfig<R extends Table.RowData> = {
  readonly id: Table.GroupRowId;
  readonly data: R;
  readonly children?: number[];
  readonly name: Model.Group["name"];
  readonly color: Model.Group["color"];
};

type CreateGroupRowConfig<R extends Table.RowData> = CreateGroupRowFromModelConfig | CreateGroupRowFromDataConfig<R>;

const isGroupRowConfigWithModel = <R extends Table.RowData>(
  config: CreateGroupRowConfig<R>
): config is CreateGroupRowFromModelConfig => (config as CreateGroupRowFromModelConfig).model !== undefined;

type GroupRowManagerConfig<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
  readonly columns: Table.Column<R, M>[];
};

export class GroupRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.GroupRowId, "group", R, M> {
  constructor(config: GroupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "group" });
  }

  getValueForRow(field: keyof R, col: Table.Column<R, M>, group: Model.Group) {
    return util.getKeyValue<Partial<Model.Group>, keyof Model.Group>(field as keyof Model.Group)(
      group
    ) as unknown as R[keyof R];
  }

  removeChildren(row: Table.GroupRow<R>, ids: SingleOrArray<number>): Table.GroupRow<R> {
    const IDs: number[] = Array.isArray(ids) ? ids : [ids];
    return this.create({
      name: row.groupData.name,
      color: row.groupData.color,
      id: row.id,
      children: filter(row.children, (child: number) => !includes(IDs, child)),
      data: row.data
    });
  }

  create(config: CreateGroupRowConfig<R>): Table.GroupRow<R> {
    if (isGroupRowConfigWithModel(config)) {
      return {
        ...this.createBasic(
          {
            ...config,
            id: groupRowId(config.model.id)
          },
          config.model
        ),
        children: config.model.children,
        groupData: {
          name: config.model.name,
          color: config.model.color
        }
      };
    }
    return {
      ...this.createBasic({
        ...config,
        id: config.id,
        data: config.data
      }),
      children: config.children || [],
      groupData: {
        name: config.name,
        color: config.color
      }
    };
  }
}
