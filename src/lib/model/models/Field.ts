import { isNil, includes } from "lodash";
import { getKeyValue } from "lib/util";
import { isRowChange, isRow, isRowChangeData } from "lib/model/typeguards/tabling";

abstract class BaseField<R extends Table.Row, M extends Model.Model> implements Table.IBaseField<R, M> {
  readonly required?: boolean;

  constructor(config: Table.IBaseField<R, M>) {
    this.required = config.required;
  }

  public abstract getValueFromRowChangeData(data: Table.RowChangeData<R>): R[keyof R] | undefined;
  public abstract getValueFromRow(row: R): R[keyof R] | undefined;
  public abstract getValue(obj: Table.DataObjType<R, M>): any;
}

abstract class WriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends BaseField<R, M>
  implements Table.IWriteField<R, M, P>
{
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly http: Http.Method[];
  readonly httpValueConverter?: (value: R[keyof R]) => P[keyof P] | undefined;
  readonly write = true;

  constructor({ allowNull, allowBlank, http, httpValueConverter, ...config }: Table.IWriteFieldConfig<R, M, P>) {
    super(config);
    this.allowBlank = allowBlank;
    this.allowNull = allowNull;
    this.http = isNil(http) || http.length === 0 ? ["POST", "PATCH"] : http;
    this.httpValueConverter = httpValueConverter;
  }

  public getHttpValue(row: R | Partial<R> | Table.RowChange<R>, method?: Http.Method): P[keyof P] | undefined {
    if (!isNil(method) && !includes(this.http, method)) {
      return undefined;
    }
    // TODO: See note below about intelligently casting return type to either
    // R[keyof R] | undefined OR M[keyof M] | undefined.  Once that is established,
    // this force coercion will not be necessary anymore.
    const value = this.getValue(row) as R[keyof R] | undefined;
    if (!isNil(this.httpValueConverter) && value !== undefined) {
      return this.httpValueConverter(value);
    }
    return value;
  }
}

abstract class ReadField<R extends Table.Row, M extends Model.Model>
  extends BaseField<R, M>
  implements Table.IReadField<R, M>
{
  readonly modelOnly?: boolean;
  readonly rowOnly?: boolean;
  readonly read = true;
  readonly rowField: keyof R;

  constructor({ modelOnly, rowOnly, rowField, ...config }: Table.IReadFieldConfig<R, M> & { rowField: keyof R }) {
    super(config);
    this.modelOnly = modelOnly;
    this.rowOnly = rowOnly;
    this.rowField = rowField;
  }

  public abstract getValueFromModel(model: M): M[keyof M];
  public getValueFromRow = (row: R) => getKeyValue<R, keyof R>(this.rowField)(row);
  public getValueFromRowChangeData = (data: Table.RowChangeData<R>) => {
    const cellChange: Table.CellChange<R[keyof R]> | undefined = getKeyValue<
      { [key in keyof R]?: Table.CellChange<R[key]> },
      keyof R
    >(this.rowField)(data);
    if (cellChange !== undefined) {
      return cellChange.newValue;
    }
    return undefined;
  };

  public getValue(obj: Table.DataObjType<R, M>): R[keyof R] | M[keyof M] | R[keyof M & keyof R] | undefined {
    if (isRowChange<R, M>(obj)) {
      const data: { [key in keyof R]?: Table.CellChange<R[key]> } = obj.data;
      return this.getValue(data);
    } else if (isRowChangeData<R, M>(obj)) {
      return this.getValueFromRowChangeData(obj);
    } else if (isRow<R, M>(obj)) {
      return this.getValueFromRow(obj);
    } else {
      return this.getValueFromModel(obj);
    }
  }
}

abstract class ReadWriteField<
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M>
> extends ReadField<R, M> {
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly http: Http.Method[];
  readonly httpValueConverter?: (value: R[keyof R]) => P[keyof P] | undefined;
  readonly write = true;
  readonly modelField: keyof M & keyof P;

  constructor({
    allowNull,
    allowBlank,
    http,
    httpValueConverter,
    modelField,
    ...config
  }: Table.IReadWriteFieldConfig<R, M, P> & {
    modelField: keyof M & keyof P;
    rowField: keyof R;
  }) {
    super(config);
    this.modelField = modelField;
    this.allowBlank = allowBlank;
    this.allowNull = allowNull;
    this.http = isNil(http) || http.length === 0 ? ["POST", "PATCH"] : http;
    this.httpValueConverter = httpValueConverter;
  }

  public getValueFromModel = (m: M) => getKeyValue<M, keyof M>(this.modelField)(m);

  public getHttpValue(row: R | Partial<R> | Table.RowChange<R>, method?: Http.Method): P[keyof P] | undefined {
    if (!isNil(method) && !includes(this.http, method)) {
      return undefined;
    }
    // TODO: See note below about intelligently casting return type to either
    // R[keyof R] | undefined OR M[keyof M] | undefined.  Once that is established,
    // this force coercion will not be necessary anymore.
    const value = this.getValue(row) as R[keyof R] | undefined;
    if (!isNil(this.httpValueConverter) && value !== undefined) {
      return this.httpValueConverter(value);
    }
    return value;
  }
}

export class AgnosticReadWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends ReadWriteField<R, M, P>
  implements Table.IAgnosticReadWriteField<R, M, P>
{
  readonly field: keyof M & keyof R & keyof P;

  constructor(config: Table.IAgnosticReadWriteFieldConfig<R, M, P>) {
    super({ modelField: config.field, rowField: config.field, ...config });
    this.field = config.field;
  }
}

export class SplitReadWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends ReadWriteField<R, M, P>
  implements Table.ISplitReadWriteField<R, M, P> {}

export class WriteOnlyField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends WriteField<R, M, P>
  implements Table.IWriteOnlyField<R, M, P>
{
  readonly field: keyof P;
  readonly writeOnly = true;

  constructor({ field, getValueFromRow, getValueFromRowChangeData, ...config }: Table.IWriteOnlyFieldConfig<R, M, P>) {
    super(config);
    this.field = field;
    this.getValueFromRow = getValueFromRow;
    this.getValueFromRowChangeData = getValueFromRowChangeData;
  }

  public getValueFromRow: (row: R) => any;
  public getValueFromRowChangeData: (data: Table.RowChangeData<R>) => any;

  public getValue(obj: Table.RowObjType<R>): any {
    if (isRowChange<R, M>(obj)) {
      const data: { [key in keyof R]?: Table.CellChange<R[key]> } = obj.data;
      return this.getValue(data);
    } else if (isRowChangeData<R, M>(obj)) {
      return this.getValueFromRowChangeData(obj);
    } else {
      return this.getValueFromRow(obj);
    }
  }
}

export class ReadOnlyField<R extends Table.Row, M extends Model.Model>
  extends ReadField<R, M>
  implements Table.IReadOnlyField<R, M>
{
  readonly field: keyof M & keyof R;
  readonly readOnly = true;

  public getValueFromModel = (m: M) => getKeyValue<M, keyof M>(this.field)(m);

  constructor({ field, ...config }: Omit<Table.IReadOnlyField<R, M>, "read" | "readOnly" | "getValue">) {
    super({ rowField: field, ...config });
    this.field = field;
  }
}

export const ReadOnly = <R extends Table.Row, M extends Model.Model>(config: Table.IReadOnlyFieldConfig<R, M>) => {
  return new ReadOnlyField<R, M>(config);
};

export const WriteOnly = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config: Table.IWriteOnlyFieldConfig<R, M, P>
) => {
  return new WriteOnlyField<R, M, P>(config);
};

export const ReadWrite = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config: Table.ISplitReadWriteFieldConfig<R, M, P> | Table.IAgnosticReadWriteFieldConfig<R, M, P>
) => {
  const isSplitNotAgnosticField = (
    field: Table.ISplitReadWriteFieldConfig<R, M, P> | Table.IAgnosticReadWriteFieldConfig<R, M, P>
  ): field is Table.ISplitReadWriteFieldConfig<R, M, P> => {
    return (
      (field as Table.ISplitReadWriteFieldConfig<R, M, P>).modelField !== undefined &&
      (field as Table.ISplitReadWriteFieldConfig<R, M, P>).rowField !== undefined
    );
  };
  if (isSplitNotAgnosticField(config)) {
    return new SplitReadWriteField<R, M, P>(config);
  } else {
    return new AgnosticReadWriteField<R, M, P>(config);
  }
};
