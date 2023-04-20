import { logger } from "internal";

import * as notifications from "../../../../deprecated/lib/notifications";
import * as model from "../../../model";
import * as columns from "../../columns";
import { CellValue } from "../../types";
import * as ids from "../ids";
import * as types from "../types";

export class FieldNotApplicableForRow extends Error {}

export type CreateRowConfig<T extends types.RowType, I extends types.RowId<T> = types.RowId<T>> = {
  readonly id: I;
  readonly rowType: T;
  readonly gridId: types.RowGridId<T>;
};

export type RowManagerConfig<T extends types.RowType> = {
  readonly rowType: T;
  readonly gridId: types.RowGridId<T>;
};

export type BodyRowManagerConfig<
  TP extends types.BodyRowType,
  R extends types.Row,
  M extends model.RowTypedApiModel,
  I extends types.RowId<TP> = types.RowId<TP>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Pick<CreateRowConfig<TP, I>, "rowType"> & {
  readonly columns: columns.Columns<R, M, N, T>;
};

export type CreateBodyRowConfig<
  R extends types.Row,
  TP extends types.BodyRowType,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> = Omit<CreateRowConfig<TP>, "rowType" | "gridId"> & {
  readonly data?: types.GetRowData<R, N, T>;
};

export const createRow = <
  R extends types.Row,
  TP extends types.RowType,
  I extends types.RowId<TP> = types.RowId<TP>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  config: CreateRowConfig<TP, I>,
): types.BaseRow<TP, types.GetRowData<R>, I> => ({
  id: config.id,
  rowType: config.rowType,
  gridId: config.gridId,
  /* The __dataType__ is just a phantom property that is used for TS - it should not be accessed
     so we simply set it to undefined. */
  __dataType__: undefined as unknown as types.RowOfType<
    TP,
    types.GetRowData<R, N, T>
  >["__dataType__"],
});

export interface RowManager<
  TP extends types.BodyRowType,
  R extends types.Row,
  M extends model.RowTypedApiModel,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> {
  readonly rowType: TP;
  readonly gridId: types.RowGridId<TP>;
  readonly columns: columns.Columns<R, M, N, T>;
}

export abstract class BodyRowManager<
  TP extends types.BodyRowType,
  R extends types.Row,
  M extends model.RowTypedApiModel,
  ARGS extends unknown[],
  I extends types.RowId<TP> = types.RowId<TP>,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
> implements RowManager<TP, R, M, N, T>
{
  public readonly rowType: TP;
  public readonly gridId: types.RowGridId<TP>;
  public readonly columns: columns.Columns<R, M, N, T>;

  constructor(config: BodyRowManagerConfig<TP, R, M, I, N, T>) {
    this.rowType = config.rowType;
    /* I do not understand why we have to coerce this type, but TS does not seem to be picking up
       the generic trace. */
    this.gridId = "data" as types.RowGridId<TP>;
    this.columns = config.columns;
  }

  abstract getValueForRow(col: columns.ModelColumn<R, M, N, T>, ...args: ARGS): T | undefined;

  public createBasic(
    config: CreateBodyRowConfig<R, TP, N, T>,
    ...args: ARGS
  ): types.BaseRow<TP, types.GetRowData<R, N, T>, I> & {
    readonly data: types.GetRowData<R, N, T>;
  } {
    const r = createRow<R, TP, I, N, T>({
      ...config,
      rowType: this.rowType,
      gridId: this.gridId,
    } as CreateRowConfig<TP, I>);
    return { ...r, data: config.data || this.createData(...args) };
  }

  throwNotApplicable(): void {
    throw new FieldNotApplicableForRow();
  }

  createData(...args: ARGS): types.GetRowData<R, N, T> {
    const models: columns.ModelColumn<R, M, N, T>[] = columns.filterModelColumns(this.columns);
    return models.reduce(
      (
        prev: types.GetRowData<R, N, T>,
        col: columns.ModelColumn<R, M, N, T>,
      ): types.GetRowData<R, N, T> => {
        try {
          const value = this.getValueForRow(col, ...args);
          if (value === undefined) {
            /* If the DataColumn is intentionally flagged with `isRead = false`, this means we do
               not pull the value from the Model but the value is instead set with value getters. */
            if (columns.isDataColumn(col) && col.isRead === false) {
              return prev;
            }
            /* If the field is not on the model, then there is a problem with the column
               configurations.  Log an error and set the value on the row to the nullValue. */
            logger.error(
              `Could not obtain row value for field ${col.field}, ${notifications.objToJson(
                args,
              )}!`,
            );
            return { ...prev, [col.field]: col.nullValue };
          }
          return { ...prev, [col.field]: value };
        } catch (e: unknown) {
          /* If the field is deemed not applicable for the given column and row,  we simply don't
             include it in the RowData object. */
          const err = e as Error;
          if (err instanceof FieldNotApplicableForRow) {
            return prev;
          }
          throw err;
        }
      },
      {} as types.GetRowData<R, N, T>,
    );
  }
}

export const createFooterRow = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  config: Omit<RowManagerConfig<"footer">, "rowType">,
): types.FooterRow<types.GetRowData<R, N, T>> => {
  const id: types.FooterRowId<"footer"> = ids.footerRowId(types.RowTypes.FOOTER);
  return createRow<R, "footer", types.FooterRowId<"footer">, N, T>({
    ...config,
    rowType: types.RowTypes.FOOTER,
    id,
  });
};

export const createPageRow = <
  R extends types.Row,
  N extends columns.ColumnFieldName<R> = columns.ColumnFieldName<R>,
  T extends CellValue<R, N> = CellValue<R, N>,
>(
  config: Omit<RowManagerConfig<"page">, "rowType">,
): types.PageRow<types.GetRowData<R, N, T>> => {
  const id: types.FooterRowId<"page"> = ids.footerRowId(types.RowTypes.PAGE);
  return createRow<R, "page", types.FooterRowId<"page">, N, T>({
    ...config,
    rowType: types.RowTypes.PAGE,
    id,
  });
};
