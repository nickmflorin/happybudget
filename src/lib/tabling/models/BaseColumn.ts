import { find } from "lodash";

import ColumnTypes from "./ColumnTypes";

interface IBaseColumnConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
  readonly field: keyof R;
  readonly headerName: string;
  readonly columnType: Table.ColumnTypeId;
  readonly tableColumnType: Table.TableColumnTypeId;
  readonly nullValue?: Table.NullValue<R> | null;
  readonly index?: number;
  readonly getRowValue?: (m: M) => R[keyof R];
}

interface IBaseColumn<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends Omit<IBaseColumnConfig<R, M>, "columnType" | "nullValue" | "applicableForGroup"> {
  readonly columnType: Table.ColumnType;
  readonly nullValue: Table.NullValue<R> | null;
  readonly index?: number;
}

/* eslint-disable indent */
class BaseColumn<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> implements IBaseColumn<R, M> {
  public readonly field: keyof R;
  public readonly headerName: string;
  public readonly columnType: Table.ColumnType;
  public readonly nullValue: Table.NullValue<R> | null = null;
  public readonly index: number | undefined = undefined;
  public readonly tableColumnType: Table.TableColumnTypeId;
  public readonly getRowValue: ((m: M) => R[keyof R]) | undefined;

  constructor(config: IBaseColumnConfig<R, M>) {
    this.field = config.field;
    this.headerName = config.headerName;
    this.columnType = find(ColumnTypes, { id: config.columnType }) as Table.ColumnType;
    this.tableColumnType = config.tableColumnType;

    this.nullValue = config.nullValue === undefined ? null : config.nullValue;
    this.index = config.index;

    this.getRowValue = config.getRowValue;
  }
}

export default BaseColumn;
