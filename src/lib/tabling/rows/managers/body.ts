import { reduce } from "lodash";

import * as notifications from "../../../notifications";
import * as columns from "../../columns";
import RowManager, { RowManagerConfig, CreateRowConfig } from "./base";

export type CreateBodyRowConfig<RW extends Table.BodyRow<R>, R extends Table.RowData> = CreateRowConfig<RW, R> & {
  readonly data?: RW["data"];
};

export type BodyRowManagerConfig<
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
      columns.filterModelColumns(this.columns),
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
            if (columns.isDataColumn(c) && c.isRead === false) {
              return obj;
            }
            console.error(`Could not obtain row value for field ${c.field}, ${notifications.objToJson(args)}!`);
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

export default BodyRowManager;
