import { forEach, isNil, includes, find, filter } from "lodash";
import { generateRandomNumericId, getKeyValue } from "lib/util";
import { isRowChange, isRow, isRowChangeData } from "./typeguards";

type BaseFieldConfig = {
  // Whether or not the field is required to be present for POST requests (i.e.
  // when creating a new instance).  If the field is required, the mechanics will
  // wait until a value is present for the field before creating an instance
  // via an HTTP POST request that is associated with the row (R).
  readonly required?: boolean;
  // The value that should be included for the field in the Placeholder row.
  readonly placeholderValue?: any;
};

type ReadFieldConfig = BaseFieldConfig & {
  readonly read: true;
  // Whether or not the model (M) field value should be used to construct the
  // row (R) model.
  readonly modelOnly?: boolean;
  // Whether or not the row (R) field should be used to update the model (M).
  readonly rowOnly?: boolean;
};

type WriteFieldConfig<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> = BaseFieldConfig & {
  readonly write: true;
  // Whether or not the field value is allowed to take on null values for HTTP
  // requests.
  readonly allowNull?: boolean;
  // Whether or not the field value is allowed to take on empty string values for
  // HTTP requests.
  readonly allowBlank?: boolean;
  // The HTTP methods that the field should be used for.  Defaults to PATCH and
  // POST requests.
  readonly http?: Http.Method[];
  // Used to transform a value that is on the row (R) model to a value that is
  // included in the HTTP PATCH or POST payloads.
  readonly httpValueConverter?: (value: R[keyof R]) => P[keyof P] | undefined;
};

type ReadWriteFieldConfig<
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M>
> = WriteFieldConfig<R, M, P> & ReadFieldConfig;

// Field configuration for Field that is included in HTTP requests to update or
// create the instance but not on the model (M) or row (R).
type WriteOnlyFieldConfig<
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M>
> = WriteFieldConfig<R, M, P> & {
  readonly field: keyof P;
  readonly writeOnly: true;
  readonly getValueFromRowChangeData: (data: Table.RowChangeData<R>) => P[keyof P] | undefined;
  readonly getValueFromRow: (row: R) => P[keyof P] | undefined;
};

// Field configuration for Field that is not included in HTTP requests to update or
// create the instance but present on the model (M) and row (R).
type ReadOnlyFieldConfig<R extends Table.Row, M extends Model.Model> = ReadFieldConfig & {
  readonly field: keyof M & keyof R;
  readonly readOnly: true;
};

type SplitReadWriteFieldConfig<
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M>
> = ReadWriteFieldConfig<R, M, P> & {
  // The name of the field on the model (M) model that the field configuration
  // corresponds to.
  readonly modelField: keyof M & keyof P;
  // The name of the field on the row (R) model that the field configuration
  // corresponds to.
  readonly rowField: keyof R;
};

type AgnosticReadWriteFieldConfig<
  R extends Table.Row,
  M extends Model.Model,
  P extends Http.ModelPayload<M>
> = ReadWriteFieldConfig<R, M, P> & {
  // The name of the field on both the row (R) model and model (M) model that the
  // field configuration corresponds to.
  readonly field: keyof M & keyof R & keyof P;
};

const isSplitConfig = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config:
    | Omit<AgnosticReadWriteFieldConfig<R, M, P>, "read" | "write">
    | Omit<SplitReadWriteFieldConfig<R, M, P>, "read" | "write">
): config is Omit<SplitReadWriteFieldConfig<R, M, P>, "read" | "write"> => {
  return (
    (config as SplitReadWriteFieldConfig<R, M, P>).modelField !== undefined &&
    (config as SplitReadWriteFieldConfig<R, M, P>).rowField !== undefined
  );
};

type PayloadType<T, P, R extends Table.Row> = T extends Table.RowChange<R> ? Partial<P> : P;
type RowObjType<R extends Table.Row> = R | Table.RowChange<R> | Table.RowChangeData<R>;
type ObjType<R extends Table.Row, M extends Model.Model> = R | M | Table.RowChange<R> | Table.RowChangeData<R>;

abstract class BaseField<R extends Table.Row, M extends Model.Model> {
  readonly required?: boolean;
  readonly placeholderValue?: any;

  constructor(config: BaseFieldConfig) {
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
  }: Omit<WriteFieldConfig<R, M, P>, "write">) {
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
  implements ReadFieldConfig {
  readonly modelOnly?: boolean;
  readonly rowOnly?: boolean;
  readonly read = true;
  readonly rowField: keyof R;

  constructor({ modelOnly, rowOnly, rowField, ...config }: Omit<ReadFieldConfig, "read"> & { rowField: keyof R }) {
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
  }: Omit<ReadWriteFieldConfig<R, M, P>, "read" | "write"> & { modelField: keyof M & keyof P; rowField: keyof R }) {
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
  implements AgnosticReadWriteFieldConfig<R, M, P> {
  readonly field: keyof M & keyof R & keyof P;

  constructor(config: Omit<AgnosticReadWriteFieldConfig<R, M, P>, "read" | "write">) {
    super({ modelField: config.field, rowField: config.field, ...config });
    this.field = config.field;
  }
}

export class SplitReadWriteField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends ReadWriteField<R, M, P>
  implements SplitReadWriteFieldConfig<R, M, P> {}

export class WriteOnlyField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>
  extends WriteField<R, M, P>
  implements WriteOnlyFieldConfig<R, M, P> {
  readonly field: keyof P;
  readonly writeOnly = true;

  constructor({
    field,
    getValueFromRow,
    getValueFromRowChangeData,
    ...config
  }: Omit<WriteOnlyFieldConfig<R, M, P>, "write" | "writeOnly">) {
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
  implements ReadOnlyFieldConfig<R, M> {
  readonly field: keyof M & keyof R;
  readonly readOnly = true;

  public getValueFromModel = (m: M) => getKeyValue<M, keyof M>(this.field)(m);

  constructor({ field, ...config }: Omit<ReadOnlyFieldConfig<R, M>, "read" | "readOnly">) {
    super({ rowField: field, ...config });
    this.field = field;
  }
}

const isReadField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Field<R, M, P>
): field is ReadOnlyField<R, M> | AgnosticReadWriteField<R, M, P> | SplitReadWriteField<R, M, P> => {
  return (field as ReadField<R, M>).read === true;
};

const isWriteField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Field<R, M, P>
): field is WriteOnlyField<R, M, P> | AgnosticReadWriteField<R, M, P> | SplitReadWriteField<R, M, P> => {
  return (field as WriteField<R, M, P>).write === true;
};

const isSplitField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Field<R, M, P>
): field is SplitReadWriteField<R, M, P> => {
  return (
    isReadField(field) &&
    isWriteField(field) &&
    (field as SplitReadWriteField<R, M, P>).modelField !== undefined &&
    (field as SplitReadWriteField<R, M, P>).rowField !== undefined
  );
};

const isWriteOnlyField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  field: Field<R, M, P>
): field is WriteOnlyField<R, M, P> => {
  return (field as WriteOnlyField<R, M, P>).writeOnly === true;
};

type WriteableField<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> =
  | SplitReadWriteField<R, M, P>
  | AgnosticReadWriteField<R, M, P>
  | WriteOnlyField<R, M, P>;

type Field<R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>> =
  | WriteableField<R, M, P>
  | ReadOnlyField<R, M>;

// const ManageField = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
//   config: FieldConfig<R, M, P>
// ) => {
//   if (isSplitConfig(config)) {
//     return new SplitReadWriteField<R, M, P>(config);
//   } else if (isWriteOnlyConfig(config)) {
//     return new WriteOnlyField<R, M, P>(config);
//   } else if (isReadOnlyConfig(config)) {
//     return new ReadOnlyField<R, M>(config);
//   } else {
//     return new AgnosticReadWriteField<R, M, P>(config);
//   }
// };

const ReadOnly = <R extends Table.Row, M extends Model.Model>(
  config: Omit<ReadOnlyFieldConfig<R, M>, "read" | "readOnly">
) => {
  return new ReadOnlyField<R, M>(config);
};

const WriteOnly = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config: Omit<WriteOnlyFieldConfig<R, M, P>, "write" | "writeOnly">
) => {
  return new WriteOnlyField<R, M, P>(config);
};

const ReadWrite = <R extends Table.Row, M extends Model.Model, P extends Http.ModelPayload<M>>(
  config:
    | Omit<SplitReadWriteFieldConfig<R, M, P>, "read" | "write">
    | Omit<AgnosticReadWriteFieldConfig<R, M, P>, "read" | "write">
) => {
  if (isSplitConfig(config)) {
    return new SplitReadWriteField<R, M, P>(config);
  } else {
    return new AgnosticReadWriteField<R, M, P>(config);
  }
};

export interface RowManagerConfig<
  R extends Table.Row<G>,
  M extends Model.Model,
  P extends Http.ModelPayload<M>,
  G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup
> {
  readonly fields: Field<R, M, P>[];
  readonly childrenGetter?: ((model: M) => number[]) | string | null;
  readonly groupGetter?: ((model: M) => number | null) | string | null;
  readonly typeLabel: string;
  readonly rowType: Table.RowType;
  readonly labelGetter: (model: M) => string;
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

class RowManager<
  R extends Table.Row<G>,
  M extends Model.Model,
  P extends Http.ModelPayload<M>,
  G extends Model.BudgetGroup | Model.TemplateGroup
> implements RowManagerConfig<R, M, P, G> {
  public fields: Field<R, M, P>[];
  public childrenGetter?: ((model: M) => number[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;
  public rowType: Table.RowType;

  constructor(config: RowManagerConfig<R, M, P, G>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
    this.rowType = config.rowType;
  }

  public get requiredFields() {
    return filter(this.fields, (field: Field<R, M, P>) => field.required === true);
  }

  public getField = (name: keyof R | keyof M): Field<R, M, P> | null => {
    return (
      find(this.fields, (field: Field<R, M, P>) => {
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
    forEach(this.fields, (field: Field<R, M, P>) => {
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
    forEach(this.fields, (field: Field<R, M, P>) => {
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
    forEach(this.fields, (field: Field<R, M, P>) => {
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
    forEach(this.fields, (field: Field<R, M, P>) => {
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

    const setValue = (field: WriteableField<R, M, P>, key: keyof P, value: any): void => {
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
    forEach(this.fields, (field: Field<R, M, P>) => {
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
    forEach(this.requiredFields, (field: Field<R, M, P>) => {
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

export const BudgetAccountRowManager = new RowManager<
  Table.BudgetAccountRow,
  Model.BudgetAccount,
  Http.BudgetAccountPayload,
  Model.BudgetGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" })
  ],
  childrenGetter: (model: Model.Account) => model.subaccounts,
  groupGetter: (model: Model.Account) => model.group,
  labelGetter: (model: Model.Account) => (!isNil(model.identifier) ? model.identifier : "Account"),
  typeLabel: "Account",
  rowType: "account"
});

export const TemplateAccountRowManager = new RowManager<
  Table.TemplateAccountRow,
  Model.TemplateAccount,
  Http.TemplateAccountPayload,
  Model.TemplateGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" })
  ],
  childrenGetter: (model: Model.TemplateAccount) => model.subaccounts,
  groupGetter: (model: Model.TemplateAccount) => model.group,
  labelGetter: (model: Model.TemplateAccount) => (!isNil(model.identifier) ? model.identifier : "Account"),
  typeLabel: "Account",
  rowType: "account"
});

export const BudgetSubAccountRowManager = new RowManager<
  Table.BudgetSubAccountRow,
  Model.BudgetSubAccount,
  Http.SubAccountPayload,
  Model.BudgetGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "quantity", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "multiplier", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: true,
      httpValueConverter: (unit: Model.Tag | null): number | null | undefined => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "identifier" }),
    ReadOnly({ field: "estimated" }),
    ReadOnly({ field: "variance" }),
    ReadOnly({ field: "actual" }),
    ReadWrite({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const TemplateSubAccountRowManager = new RowManager<
  Table.TemplateSubAccountRow,
  Model.TemplateSubAccount,
  Http.SubAccountPayload,
  Model.TemplateGroup
>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "name", allowNull: true }),
    // We want to attribute the full group to the row, not just the ID.
    ReadWrite({ field: "group", allowNull: true, modelOnly: true }),
    ReadWrite({ field: "quantity", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "multiplier", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: true,
      httpValueConverter: (unit: Model.Tag | null): number | null | undefined => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "identifier", allowNull: true }),
    ReadOnly({ field: "estimated" }),
    ReadWrite({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<Table.ActualRow, Model.Actual, Http.ActualPayload, Model.Group>({
  fields: [
    ReadWrite({ field: "description", allowNull: true }),
    // TODO: Eventually, we need to allow this to be null.
    WriteOnly({
      field: "object_id",
      http: ["PATCH"],
      required: true,
      getValueFromRow: (row: Table.ActualRow) => {
        if (!isNil(row.account)) {
          return row.account.id;
        }
        return null;
      },
      getValueFromRowChangeData: (data: Table.RowChangeData<Table.ActualRow>) => {
        const cellChange: Table.CellChange<Table.ActualRow[keyof Table.ActualRow]> | undefined = getKeyValue<
          { [key in keyof Table.ActualRow]?: Table.CellChange<Table.ActualRow[key]> },
          keyof Table.ActualRow
        >("account")(data);
        if (cellChange !== undefined) {
          const account: Model.SimpleAccount | Model.SimpleSubAccount | null = cellChange.newValue;
          if (account !== null) {
            return account.id;
          }
          return null;
        }
        return undefined;
      }
    }),
    // TODO: Eventually, we need to allow this to be null.
    WriteOnly({
      field: "parent_type",
      http: ["PATCH"],
      required: true,
      getValueFromRow: (row: Table.ActualRow) => {
        if (!isNil(row.account)) {
          return row.account.type;
        }
        return null;
      },
      getValueFromRowChangeData: (data: Table.RowChangeData<Table.ActualRow>) => {
        const cellChange: Table.CellChange<Table.ActualRow[keyof Table.ActualRow]> | undefined = getKeyValue<
          { [key in keyof Table.ActualRow]?: Table.CellChange<Table.ActualRow[key]> },
          keyof Table.ActualRow
        >("account")(data);
        if (cellChange !== undefined) {
          const account: Model.SimpleAccount | Model.SimpleSubAccount | null = cellChange.newValue;
          if (account !== null) {
            return account.type;
          }
          return null;
        }
        return undefined;
      }
    }),
    ReadOnly({ field: "account" }),
    ReadWrite({ field: "vendor", allowNull: true }),
    ReadWrite({ field: "purchase_order", allowNull: true }),
    ReadWrite({ field: "date", allowNull: true }),
    ReadWrite({
      field: "payment_method",
      allowNull: true,
      httpValueConverter: (payment_method: Model.PaymentMethod | null) => {
        if (payment_method !== null) {
          return payment_method.id;
        }
        return null;
      }
    }),
    ReadWrite({ field: "payment_id", allowNull: true }),
    ReadWrite({ field: "value", allowNull: true })
  ],
  labelGetter: (model: Model.Actual) => String(!isNil(model.account) ? model.account.identifier : ""),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<Table.FringeRow, Model.Fringe, Http.FringePayload, Model.Group>({
  fields: [
    ReadWrite({ field: "name", required: true }),
    ReadWrite({ field: "description", allowNull: true }),
    ReadWrite({ field: "cutoff", allowNull: true }),
    ReadWrite({ field: "rate", allowNull: true }),
    ReadWrite({ field: "color", allowNull: true }),
    ReadWrite({
      field: "unit",
      allowNull: false,
      httpValueConverter: (unit: Model.FringeUnit | null) => {
        if (unit !== null) {
          return unit.id;
        }
        return null;
      }
    })
  ],
  labelGetter: (model: Model.Fringe) => String(model.name),
  typeLabel: "Fringe",
  rowType: "fringe"
});

export default RowManager;
