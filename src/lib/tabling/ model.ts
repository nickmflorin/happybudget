import { forEach, isNil, includes, find, filter } from "lodash";
import { generateRandomNumericId, getKeyValue } from "lib/util";
import { isRowChange, isRow, isRowChangeData, isSplitField, isWriteField } from "./typeguards";

type PayloadType<T, P, R extends Table.Row> = T extends Table.RowChange<R> ? Partial<P> : P;
type RowObjType<R extends Table.Row> = R | Table.RowChange<R> | Table.RowChangeData<R>;
type ObjType<R extends Table.Row, M extends Model.Model> = R | M | Table.RowChange<R> | Table.RowChangeData<R>;

export const isWriteOnlyField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Table.Field<R, M, P>
): field is Table.IWriteOnlyField<R, M, P> => {
  return (field as Table.IWriteOnlyField<R, M, P>).writeOnly === true;
};

abstract class BaseField<R extends Table.Row, M extends Model.Model> {
  readonly required?: boolean;
  readonly placeholderValue?: any;

  constructor(config: Table.IBaseField) {
    this.required = config.required;
    this.placeholderValue = config.placeholderValue;
  }

  // public abstract getValue(obj: ObjType<R, M, P>): R[keyof R] | M[keyof M] | undefined;
  public abstract getValueFromRowChangeData(data: Table.RowChangeData<R>): R[keyof R] | undefined;
  public abstract getValueFromRow(row: R): R[keyof R] | undefined;
  public abstract getValue(obj: ObjType<R, M>): R[keyof R] | M[keyof M] | R[keyof M & keyof R] | undefined;
  public abstract getValue(obj: RowObjType<R>): any;
}

abstract class WriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> extends BaseField<
  R,
  M
> {
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly http: Http.Method[];
  readonly httpValueConverter?: (value: R[keyof R]) => P[keyof P] | undefined;
  readonly write = true;

  constructor({
    allowNull,
    allowBlank,
    http,
    httpValueConverter,
    ...config
  }: Omit<Table.IWriteField<R, M, P>, "write">) {
    super(config);
    this.allowBlank = allowBlank;
    this.allowNull = allowNull;
    this.http = isNil(http) || http.length === 0 ? ["POST", "PATCH"] : http;
    this.httpValueConverter = httpValueConverter;
  }

  public getHttpValue(row: R | Table.RowChange<R>, method?: Http.Method): P[keyof P] | undefined {
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
  implements Table.IReadField {
  readonly modelOnly?: boolean;
  readonly rowOnly?: boolean;
  readonly read = true;
  readonly rowField: keyof R;

  constructor({ modelOnly, rowOnly, rowField, ...config }: Omit<Table.IReadField, "read"> & { rowField: keyof R }) {
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

  public getValue(obj: ObjType<R, M>): R[keyof R] | M[keyof M] | R[keyof M & keyof R] | undefined {
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
  }: Omit<Table.IReadWriteField<R, M, P>, "read" | "write"> & { modelField: keyof M & keyof P; rowField: keyof R }) {
    super(config);
    this.modelField = modelField;
    this.allowBlank = allowBlank;
    this.allowNull = allowNull;
    this.http = isNil(http) || http.length === 0 ? ["POST", "PATCH"] : http;
    this.httpValueConverter = httpValueConverter;
  }

  public getValueFromModel = (m: M) => getKeyValue<M, keyof M>(this.modelField)(m);

  public getHttpValue(row: R | Table.RowChange<R>, method?: Http.Method): P[keyof P] | undefined {
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
  implements Table.IAgnosticReadWriteField<R, M, P> {
  readonly field: keyof M & keyof R & keyof P;

  constructor(config: Omit<Table.IAgnosticReadWriteField<R, M, P>, "read" | "write">) {
    super({ modelField: config.field, rowField: config.field, ...config });
    this.field = config.field;
  }
}

export class SplitReadWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends ReadWriteField<R, M, P>
  implements Table.ISplitReadWriteField<R, M, P> {}

export class WriteOnlyField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends WriteField<R, M, P>
  implements Table.IWriteOnlyField<R, M, P> {
  readonly field: keyof P;
  readonly writeOnly = true;

  constructor({
    field,
    getValueFromRow,
    getValueFromRowChangeData,
    ...config
  }: Omit<Table.IWriteOnlyField<R, M, P>, "write" | "writeOnly">) {
    super(config);
    this.field = field;
    this.getValueFromRow = getValueFromRow;
    this.getValueFromRowChangeData = getValueFromRowChangeData;
  }

  public getValueFromRow: (row: R) => any;
  public getValueFromRowChangeData: (data: Table.RowChangeData<R>) => any;

  public getValue(obj: RowObjType<R>): any {
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
  implements Table.IReadOnlyField<R, M> {
  readonly field: keyof M & keyof R;
  readonly readOnly = true;

  public getValueFromModel = (m: M) => getKeyValue<M, keyof M>(this.field)(m);

  constructor({ field, ...config }: Omit<Table.IReadOnlyField<R, M>, "read" | "readOnly">) {
    super({ rowField: field, ...config });
    this.field = field;
  }
}

const defaultRowMeta: Partial<Table.RowMeta> = {
  isPlaceholder: false,
  isGroupFooter: false,
  isTableFooter: false,
  isBudgetFooter: false,
  selected: false,
  children: [],
  errors: [],
  fieldsLoading: []
};

export class RowManager<
  R extends Table.Row<G>,
  M extends Model.Model,
  P extends Http.ModelPayload<M>,
  G extends Model.BudgetGroup | Model.TemplateGroup
> implements Table.IRowManager<R, M, P, G> {
  public fields: Table.Field<R, M, P>[];
  public childrenGetter?: ((model: M) => number[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;
  public rowType: Table.RowType;

  constructor(config: Table.IRowManager<R, M, P, G>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
    this.rowType = config.rowType;
  }

  public get requiredFields() {
    return filter(this.fields, (field: Table.Field<R, M, P>) => field.required === true);
  }

  public getField = (name: keyof R | keyof M): Table.Field<R, M, P> | null => {
    return (
      find(this.fields, (field: Table.Field<R, M, P>) => {
        if (isSplitField(field)) {
          return field.rowField === name;
        } else {
          return field.field === name;
        }
      }) || null
    );
  };

  public getChildren = (model: M): number[] => {
    if (typeof this.childrenGetter === "string") {
      const children: any = model[this.childrenGetter as keyof M];
      if (!isNil(children)) {
        return children;
      } else {
        /* eslint-disable no-console */
        console.warn(`Could not parse children from model based on model field ${this.childrenGetter}!`);
        return [];
      }
    } else if (!isNil(this.childrenGetter)) {
      return this.childrenGetter(model);
    } else {
      return [];
    }
  };

  public getGroup = (model: M): number | null => {
    if (this.groupGetter === null) {
      return null;
    } else if (typeof this.groupGetter === "string") {
      const group: any = model[this.groupGetter as keyof M];
      if (group !== undefined) {
        return group;
      } else {
        /* eslint-disable no-console */
        console.warn(`Could not parse group from model based on model field ${this.groupGetter}!`);
        return null;
      }
    } else if (!isNil(this.groupGetter)) {
      return this.groupGetter(model);
    } else {
      return null;
    }
  };

  public createPlaceholder = (): R => {
    let obj: { [key in keyof R]?: R[key] } = {};
    obj = {
      ...obj,
      id: generateRandomNumericId(),
      group: null,
      meta: {
        ...defaultRowMeta,
        isPlaceholder: true,
        label: "Placeholder",
        typeLabel: this.typeLabel,
        type: this.rowType
      }
    };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (!isWriteOnlyField(field)) {
        if (isSplitField(field)) {
          obj[field.rowField] = field.placeholderValue || null;
        } else {
          obj[field.field] = field.placeholderValue || null;
        }
      }
    });
    return obj as R;
  };

  public modelToRow = (model: M, group: G | null, meta: Partial<Table.RowMeta> = {}): R => {
    let obj: { [key in keyof R]?: R[key] } = {};
    obj = {
      ...obj,
      id: model.id,
      group,
      meta: {
        ...defaultRowMeta,
        children: this.getChildren(model),
        label: this.labelGetter(model),
        typeLabel: this.typeLabel,
        type: this.rowType,
        ...meta
      }
    };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (!isWriteOnlyField(field)) {
        if (field.modelOnly !== true) {
          const v = field.getValue(model) as R[keyof R];
          if (v !== undefined) {
            if (isSplitField(field)) {
              obj[field.rowField] = v;
            } else {
              obj[field.field] = v as R[keyof R & keyof M];
            }
          }
        }
      }
    });
    return obj as R;
  };

  public mergeChangesWithRow = (obj: R, change: Table.RowChange<R>): R => {
    const row: R = { ...obj };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (!isWriteOnlyField(field)) {
        // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
        // understand that the model (M) field name is related to the row (R) field name via the
        // field configurations.
        const v = field.getValue(change) as R[keyof R] | R[keyof M & keyof R] | undefined;
        if (v !== undefined) {
          if (isSplitField(field)) {
            row[field.rowField] = v;
          } else {
            row[field.field] = v as R[keyof R & keyof M & keyof P];
          }
        }
      }
    });
    return row;
  };

  public mergeChangesWithModel = (obj: M, change: Table.RowChange<R>): M => {
    const model: M = { ...obj };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      if (!isWriteOnlyField(field) && !field.rowOnly) {
        const v = field.getValue(change);
        if (v !== undefined) {
          if (isSplitField(field)) {
            model[field.modelField] = v as M[keyof M & keyof P];
          } else {
            model[field.field] = v as M[keyof M & keyof R & keyof P];
          }
        }
      }
    });
    return model;
  };

  public payload = <T extends R | Table.RowChange<R>>(row: T): PayloadType<T, P, R> => {
    /* eslint-disable no-unused-vars */
    const obj: { [key in keyof P]?: P[keyof P] } = {};
    const method: Http.Method = isRowChange(row) ? "PATCH" : "POST";

    const setValue = (field: Table.WriteableField<R, M, P>, key: keyof P, value: any): void => {
      if (value !== undefined) {
        if (value === null) {
          if (field.allowNull === true) {
            obj[key] = value;
          }
        } else if ((value as any) === "") {
          if (field.allowBlank === true) {
            obj[key] = "" as P[keyof P];
          }
        } else {
          obj[key] = value;
        }
      }
    };
    forEach(this.fields, (field: Table.Field<R, M, P>) => {
      if (isWriteField(field)) {
        const httpValue = field.getHttpValue(row, method);
        if (isSplitField(field)) {
          setValue(field, field.modelField, httpValue);
        } else {
          setValue(field, field.field, httpValue);
        }
      }
    });
    return obj as PayloadType<T, P, R>;
  };

  rowHasRequiredFields = (row: R): boolean => {
    let requiredFieldsPresent = true;
    forEach(this.requiredFields, (field: Table.Field<R, M, P>) => {
      let value: any;
      // TODO: Write only fields are not stored on the row (R), so the only associated
      // value is the HTTP value which is derived from the row (R).  We might want to
      // only allow the required flag to be set on the underlying row (R) fields and not
      // on the derived fields.
      if (isWriteOnlyField(field)) {
        value = field.getHttpValue(row);
      } else {
        value = field.getValue(row);
      }
      // TODO: We have to build this out better to check for other data structures
      // as well - like arrays and things of that nature.
      if (isNil(value) || (value as any) === "") {
        requiredFieldsPresent = false;
        return false;
      }
    });
    return requiredFieldsPresent;
  };
}

export const ReadOnly = <R extends Table.Row, M extends Model.Model>(
  config: Omit<Table.IReadOnlyField<R, M>, "read" | "readOnly">
) => {
  return new ReadOnlyField<R, M>(config);
};

export const WriteOnly = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config: Omit<Table.IWriteOnlyField<R, M, P>, "write" | "writeOnly">
) => {
  return new WriteOnlyField<R, M, P>(config);
};

export const ReadWrite = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config:
    | Omit<Table.ISplitReadWriteField<R, M, P>, "read" | "write">
    | Omit<Table.IAgnosticReadWriteField<R, M, P>, "read" | "write">
) => {
  if (isSplitField(config)) {
    return new SplitReadWriteField<R, M, P>(config);
  } else {
    return new AgnosticReadWriteField<R, M, P>(config);
  }
};
