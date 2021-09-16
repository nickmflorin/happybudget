import { find } from "lodash";

import ColumnTypes from "./ColumnTypes";

interface IBaseColumnConfig<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> {
  readonly field: keyof R;
  readonly headerName: string;
  readonly columnType: Table.ColumnTypeId;
  readonly tableColumnType: Table.TableColumnTypeId;
  readonly nullValue?: Table.NullValue;
  readonly index?: number;
  // If provided, this column will populate the values for Group Rows based on this field on the Group.
  readonly groupField?: keyof G;
  // If provided, this column will populate the values for teh Group Rows based on the same field
  // as this column, so as long as groupField is not provided.
  readonly applicableForGroup?: boolean;
  readonly getRowValue?: (m: M) => R[keyof R];
}

interface IBaseColumn<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>
  extends Omit<IBaseColumnConfig<R, M, G>, "columnType" | "nullValue" | "applicableForGroup"> {
  readonly columnType: Table.ColumnType;
  readonly nullValue: Table.NullValue;
  readonly index?: number;
  // If provided, this column will populate the values for teh Group Rows based on the same field
  // as this column, so as long as groupField is not provided.
  readonly applicableForGroup: boolean;
}

/* eslint-disable indent */
class BaseColumn<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>
  implements IBaseColumn<R, M, G>
{
  public readonly field: keyof R;
  public readonly headerName: string;
  public readonly columnType: Table.ColumnType;
  public readonly nullValue: Table.NullValue = null;
  public readonly index: number | undefined = undefined;
  public readonly applicableForGroup: boolean;
  public readonly groupField: keyof G | undefined;
  public readonly tableColumnType: Table.TableColumnTypeId;
  public readonly getRowValue: ((m: M) => R[keyof R]) | undefined;

  constructor(config: IBaseColumnConfig<R, M, G>) {
    this.field = config.field;
    this.headerName = config.headerName;
    this.columnType = find(ColumnTypes, { id: config.columnType }) as Table.ColumnType;
    this.tableColumnType = config.tableColumnType;

    this.nullValue = config.nullValue === undefined ? null : config.nullValue;
    this.index = config.index;

    this.groupField = config.groupField;
    this.applicableForGroup = config.applicableForGroup === undefined ? false : config.applicableForGroup;
    this.getRowValue = config.getRowValue;
  }
}

export default BaseColumn;
