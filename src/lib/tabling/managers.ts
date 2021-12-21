import { reduce, filter, isNil, includes } from "lodash";
import { util, budgeting } from "lib";

import * as typeguards from "./typeguards";
import * as columnFns from "./columns";

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

type CreateRowConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly id: RW["id"];
};

type RowManagerConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly rowType: RW["rowType"];
  readonly gridId: RW["gridId"];
};

abstract class RowManager<RW extends Table.Row<R>, R extends Table.RowData> {
  public rowType: RW["rowType"];
  public gridId: RW["gridId"];

  constructor(config: RowManagerConfig<RW, R>) {
    this.rowType = config.rowType;
    this.gridId = config.gridId;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public createBasic(config: CreateRowConfig<RW, R>): Pick<RW, "id" | "rowType" | "gridId"> {
    return {
      id: config.id,
      rowType: this.rowType,
      gridId: this.gridId
    };
  }
}

export const createRow = <RW extends Table.Row<R>, R extends Table.RowData>(
  config: RowManagerConfig<RW, R> & CreateRowConfig<RW, R>
): Pick<RW, "id" | "rowType" | "gridId"> => {
  return {
    id: config.id,
    rowType: config.rowType,
    gridId: config.gridId
  };
};

export const createFooterRow = <Grid extends Table.FooterGridId = Table.FooterGridId>(
  config: Omit<RowManagerConfig<Table.FooterRow<Grid>, Table.RowData>, "rowType">
): Table.FooterRow =>
  createRow<Table.FooterRow, Table.RowData>({ ...config, rowType: "footer", id: footerRowId(config.gridId) });

type CreateBodyRowConfig<RW extends Table.BodyRow<R>, R extends Table.RowData> = CreateRowConfig<RW, R> & {
  readonly data?: RW["data"];
};

type BodyRowManagerConfig<
  RW extends Table.BodyRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<RowManagerConfig<RW, R>, "gridId"> & {
  readonly columns: Table.Column<R, M>[];
};

abstract class BodyRowManager<
  RW extends Table.BodyRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> extends RowManager<RW, R> {
  public columns: Table.Column<R, M>[];

  constructor(config: BodyRowManagerConfig<RW, R, M>) {
    super({ ...config, gridId: "data" });
    this.columns = config.columns;
  }

  abstract getValueForRow<
    V extends Table.RawRowValue,
    C extends Table.ModelColumn<R, M, V>
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  >(col: C, ...args: any[]): [V | undefined, boolean];

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  createData(...args: any[]): R {
    return reduce(
      columnFns.filterModelColumns(this.columns),
      (obj: R, c: Table.ModelColumn<R, M>): R => {
        /* If we are dealing with a calculated or body column, we only read
					the value directly from the model if that column does not have
					`isRead` set to false. */
        const [value, isApplicable] = this.getValueForRow(c, ...args);
        if (isApplicable) {
          if (value === undefined) {
            /* If the DataColumn is intentionally flagged with `isRead = false`,
							 this means we do not pull the value from the Model but the value
							 is instead set with value getters. */
            if (typeguards.isDataColumn(c) && c.isRead === false) {
              return obj;
            }
            console.error(`Could not obtain row value for field ${c.field}, ${JSON.stringify(args)}!`);
            return { ...obj, [c.field]: c.nullValue };
          }
          return { ...obj, [c.field]: value };
        }
        return obj;
      },
      {} as R
    );
  }

  public createBasic(
    config: CreateBodyRowConfig<RW, R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    ...args: any[]
  ): Pick<RW, "id" | "rowType" | "gridId" | "data"> {
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

type PlaceholderRowConfig<
  RW extends Table.PlaceholderRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> = Omit<BodyRowManagerConfig<RW, R, M>, "rowType"> & {
  readonly defaultData?: Partial<R>;
};

export class PlaceholderRowManager<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends BodyRowManager<Table.PlaceholderRow<R>, R, M> {
  public getRowChildren: ((m: M) => number[]) | undefined;
  public defaultData?: Partial<R>;

  constructor(config: PlaceholderRowConfig<Table.PlaceholderRow<R>, R, M>) {
    super({ ...config, rowType: "placeholder" });
    this.defaultData = config.defaultData;
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    data?: Partial<R>
  ): [V | undefined, boolean] {
    const value = this.defaultData === undefined ? undefined : (this.defaultData[col.field] as V | undefined);
    if (value === undefined) {
      if (data === undefined || data[col.field] === undefined) {
        return [col.nullValue, false];
      }
      return [data[col.field] as unknown as V, true];
    }
    return [value, true];
  }

  create(config: CreatePlaceholderRowConfig<R>): Table.PlaceholderRow<R> {
    return {
      children: [],
      ...this.createBasic({ id: config.id }, config.data)
    };
  }
}

type GetRowValue<R extends Table.RowData, M extends Model.RowHttpModel, V extends Table.RawRowValue> = (
  m: M,
  col: Table.DataColumn<R, M>,
  original: (ci: Table.DataColumn<R, M>, mi: M) => V | undefined
) => V | undefined;

type CreateModelRowFromModelConfig<R extends Table.RowData, M extends Model.RowHttpModel> = {
  readonly model: M;
  // Used solely for PDF purposes.
  readonly getRowValue?: GetRowValue<R, M, Table.RawRowValue> | undefined;
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
> extends BodyRowManager<Table.ModelRow<R>, R, M> {
  public getRowChildren: ((m: M) => number[]) | undefined;

  constructor(config: ModelRowManagerConfig<R, M>) {
    super({ ...config, rowType: "model" });
    this.getRowChildren = config.getRowChildren;
  }

  getValueForRow<
    V extends Table.RawRowValue,
    C extends Table.ModelColumn<R, M, V>
    // The optional `getRowValue` callback is only used for PDF cases.
  >(col: C, m: M, getRowValue?: GetRowValue<R, M, V>): [V | undefined, boolean] {
    if (!isNil(getRowValue) && typeguards.isDataColumn<R, M>(col)) {
      return [
        getRowValue(m, col, (colr: Table.DataColumn<R, M>, mr: M) => this.getValueForRow<V, C>(colr as C, mr)[0]),
        true
      ];
    } else {
      if (!isNil(col.getRowValue)) {
        return [col.getRowValue(m), true];
      } else {
        return [util.getKeyValue<M, keyof M>(col.field as keyof M)(m) as unknown as V | undefined, true];
      }
    }
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
  readonly data: Pick<R, keyof Model.Markup>;
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
> extends BodyRowManager<Table.MarkupRow<R>, R, M> {
  constructor(config: MarkupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "markup" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    markup: Model.Markup
  ): [V | undefined, boolean] {
    // The FakeColumn(s) are not applicable for Markups.
    if (typeguards.isDataColumn<R, M>(col) && !isNil(col.markupField)) {
      return [markup[col.markupField] as V | undefined, true];
    }
    /* We want to indicate that the value is nnot applicable for the column so
		 	 that it is not included in the row data and a warning is not issued when
			 the value is undefined */
    return [undefined, false];
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
  readonly data: Pick<R, keyof Model.Group>;
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
> extends BodyRowManager<Table.GroupRow<R>, R, M> {
  constructor(config: GroupRowManagerConfig<R, M>) {
    super({ ...config, rowType: "group" });
  }

  getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    group: Model.Group
  ): [V | undefined, boolean] {
    // The FakeColumn(s) are not applicable for Groups.
    if (typeguards.isDataColumn<R, M>(col) && !isNil(col.groupField)) {
      return [group[col.groupField] as V, true];
    }
    /* We want to indicate that the value is not applicable for the column so
		 	 that it is not included in the row data and a warning is not issued when
			 the value is undefined */
    return [undefined, false];
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
