import { reduce } from "lodash";

import { tabling, notifications } from "lib";

import * as ids from "../ids";

export class FieldNotApplicableForRow extends Error {}

export type CreateRowConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly id: RW["id"];
  readonly rowType: RW["rowType"];
  readonly gridId: RW["gridId"];
};

export type RowManagerConfig<RW extends Table.Row<R>, R extends Table.RowData> = {
  readonly rowType: RW["rowType"];
  readonly gridId: RW["gridId"];
};

export type BodyRowManagerConfig<
  RW extends Table.BodyRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel
> = Pick<CreateRowConfig<RW, R>, "rowType"> & {
  readonly columns: Table.Column<R, M>[];
};

export type CreateBodyRowConfig<RW extends Table.BodyRow<R>, R extends Table.RowData> = Omit<
  CreateRowConfig<RW, R>,
  "rowType" | "gridId"
> & {
  readonly data?: RW["data"];
};

export const createRow = <RW extends Table.Row<R>, R extends Table.RowData>(
  config: CreateRowConfig<RW, R>
): Pick<RW, "id" | "rowType" | "gridId"> => ({
  id: config.id,
  rowType: config.rowType,
  gridId: config.gridId
});

abstract class BodyRowManager<
  RW extends Table.BodyRow<R>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  ARGS extends unknown[]
> {
  public rowType: RW["rowType"];
  public gridId: RW["gridId"];
  public columns: Table.Column<R, M>[];

  constructor(config: BodyRowManagerConfig<RW, R, M>) {
    this.rowType = config.rowType;
    this.gridId = "data";
    this.columns = config.columns;
  }

  abstract getValueForRow<V extends Table.RawRowValue, C extends Table.ModelColumn<R, M, V>>(
    col: C,
    ...args: ARGS
  ): V | undefined;

  public createBasic(
    config: CreateBodyRowConfig<RW, R>,
    ...args: ARGS
  ): Pick<RW, "id" | "rowType" | "gridId" | "data"> {
    return {
      ...createRow({ ...config, rowType: this.rowType, gridId: this.gridId }),
      data: config.data || this.createData(...args)
    };
  }

  throwNotApplicable(): void {
    throw new FieldNotApplicableForRow();
  }

  createData(...args: ARGS): R {
    return reduce(
      tabling.columns.filterModelColumns(this.columns),
      (obj: R, c: Table.ModelColumn<R, M>): R => {
        try {
          const value = this.getValueForRow(c, ...args);
          if (value === undefined) {
            /* If the DataColumn is intentionally flagged with `isRead = false`,
						   this means we do not pull the value from the Model but the value
						   is instead set with value getters. */
            if (tabling.columns.isDataColumn(c) && c.isRead === false) {
              return obj;
            }
            /* If the field is not on the model, then there is a problem with
               the column configurations.  Log an error and set the value on
               the row to the nullValue. */
            console.error(`Could not obtain row value for field ${c.field}, ${notifications.objToJson(args)}!`);
            return { ...obj, [c.field]: c.nullValue };
          }
          return { ...obj, [c.field]: value };
        } catch (e: unknown) {
          /* If the field is deemed not applicable for the given column and row,
             we simply don't include it in the RowData object. */
          const err = e as Error;
          if (err instanceof FieldNotApplicableForRow) {
            return obj;
          }
          throw err;
        }
      },
      {} as R
    );
  }
}

export const createFooterRow = <Grid extends Table.FooterGridId = Table.FooterGridId>(
  config: Omit<RowManagerConfig<Table.FooterRow<Grid>, Table.RowData>, "rowType">
): Table.FooterRow =>
  createRow<Table.FooterRow, Table.RowData>({
    ...config,
    rowType: "footer",
    id: ids.footerRowId(config.gridId)
  });

export default BodyRowManager;
