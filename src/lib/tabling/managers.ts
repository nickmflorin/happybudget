import { forEach, isNil, includes } from "lodash";
import { generateRandomNumericId, getKeyValue } from "lib/util";
import { SubAccountUnits } from "lib/model";
import { findChoiceModelForName } from "lib/model/util";
import { isRowChange, isRow, isRowChangeData } from "./typeguards";

type BaseFieldConfig<R extends Table.Row, M extends Model> = {
  // Whether or not the field is required to be present for POST requests (i.e.
  // when creating a new instance).  If the field is required, the mechanics will
  // wait until a value is present for the field before creating an instance
  // via an HTTP POST request that is associated with the row (R).
  readonly required?: boolean;
  // Whether or not the field value is allowed to take on null values for HTTP
  // requests.
  readonly allowNull?: boolean;
  // Whether or not the field value is allowed to take on empty string values for
  // HTTP requests.
  readonly allowBlank?: boolean;
  // The value that should be included for the field in the Placeholder row.
  readonly placeholderValue?: any;
  // Whether or not the model (M) field value should be used to construct the
  // row (R) model.
  readonly inRow?: boolean;
  // The HTTP methods that the field should be used for.  Defaults to PATCH and
  // POST requests.  Note that setting http: [] is the same as setting readOnly: true.
  readonly http?: Http.Method[];
  // If set to True, will not be included in HTTP requests to update or create
  // the instance associated with the field - but will be used to translate a
  // received instance via an HTTP GET request to the corresponding model (M).
  readonly readOnly?: boolean;
  // Used to translate a field-value pair on the model (M) model to a field-value
  // pair on the row (R) model.
  readonly setter?: (model: M) => R[keyof R];
  // Used to translate a field-value pair on the row (R) model to a field-value
  // pair on the model (M) model.
  readonly getter?: (row: R) => M[keyof M];
  // Used to transform a value that is on the row (R) model to a value that is
  // included in the HTTP PATCH or POST payloads.
  readonly httpGetter?: (value: R[keyof R]) => M[keyof M] | undefined;
};

type SplitManagedFieldConfig<R extends Table.Row, M extends Model> = BaseFieldConfig<R, M> & {
  // The name of the field on the model (M) model that the field configuration
  // corresponds to.
  readonly modelField: keyof M;
  // The name of the field on the row (R) model that the field configuration
  // corresponds to.
  readonly rowField: keyof R;
};

type AgnosticManagedFieldConfig<R extends Table.Row, M extends Model> = BaseFieldConfig<R, M> & {
  // The name of the field on both the row (R) model and model (M) model that the
  // field configuration corresponds to.
  readonly field: keyof M & keyof R;
};

type ManagedFieldConfig<R extends Table.Row, M extends Model> =
  | SplitManagedFieldConfig<R, M>
  | AgnosticManagedFieldConfig<R, M>;

const isSplitConfig = <R extends Table.Row, M extends Model>(
  config: ManagedFieldConfig<R, M>
): config is SplitManagedFieldConfig<R, M> => {
  return (config as SplitManagedFieldConfig<R, M>).modelField !== undefined;
};

type PayloadType<T, P, R extends Table.Row> = T extends Table.RowChange<R> ? Partial<P> : P;

abstract class BaseManagedField<R extends Table.Row, M extends Model> {
  readonly required?: boolean;
  readonly readOnly?: boolean;
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly http: Http.Method[];
  readonly placeholderValue?: any;
  readonly inRow?: boolean;
  readonly setter?: (model: M) => R[keyof R];
  readonly getter?: (row: R) => M[keyof M];
  readonly httpGetter?: (value: R[keyof R]) => M[keyof M] | undefined;

  constructor(config: ManagedFieldConfig<R, M>) {
    this.required = config.required;
    this.readOnly = config.readOnly;
    this.allowBlank = config.allowBlank;
    this.allowNull = config.allowNull;
    this.http = config.http || ["POST", "PATCH"];
    this.placeholderValue = config.placeholderValue;
    this.inRow = config.inRow;
    this.setter = config.setter;
    this.getter = config.getter;
    this.httpGetter = config.httpGetter;
  }

  public abstract getRawValue(obj: R): R[keyof R] | undefined;
  public abstract getRawValue(obj: M): M[keyof M] | undefined;
  public abstract getRawValue(obj: Table.RowChange<R>): R[keyof R] | undefined;
  public abstract getRawValue(obj: Table.RowChangeData<R>): R[keyof R] | undefined;
  public abstract getRawValue(
    obj: R | M | Table.RowChange<R> | Table.RowChangeData<R>
  ): R[keyof R] | M[keyof M] | undefined;

  getHttpValue = (row: R | Table.RowChange<R>, method?: Http.Method): any => {
    if (!isNil(method) && !includes(this.http, method)) {
      return undefined;
    }
    // TODO: See note below about intelligently casting return type to either
    // R[keyof R] | undefined OR M[keyof M] | undefined.  Once that is established,
    // this force coercion will not be necessary anymore.
    const value = this.getRawValue(row) as R[keyof R] | undefined;
    if (!isNil(this.httpGetter) && value !== undefined) {
      return this.httpGetter(value);
    }
    return value;
  };

  getValueFromModel = (model: M) => {
    if (!isNil(this.setter)) {
      return this.setter(model);
    }
    return this.getRawValue(model);
  };

  getValueFromRow = (row: R) => {
    if (!isNil(this.getter)) {
      return this.getter(row);
    }
    return this.getRawValue(row);
  };
}

export class AgnosticManagedField<R extends Table.Row, M extends Model>
  extends BaseManagedField<R, M>
  implements AgnosticManagedFieldConfig<R, M> {
  readonly field: keyof M & keyof R;

  constructor(config: AgnosticManagedFieldConfig<R, M>) {
    super(config);
    this.field = config.field;
  }

  /* eslint-disable no-dupe-class-members */
  public getRawValue(obj: R): R[keyof R] | undefined;
  public getRawValue(obj: M): M[keyof M] | undefined;
  public getRawValue(obj: Table.RowChange<R>): R[keyof R] | undefined;
  public getRawValue(obj: Table.RowChangeData<R>): R[keyof R] | undefined;

  // TODO: Intelligently cast return type to either R[keyof R] | undefined OR M[keyof M] | undefined.
  public getRawValue(obj: R | M | Table.RowChange<R> | Table.RowChangeData<R>): R[keyof R] | M[keyof M] | undefined {
    if (isRowChange<R, M>(obj)) {
      const data: { [key in keyof R]?: Table.CellChange<R[key]> } = obj.data;
      return this.getRawValue(data);
    } else if (isRowChangeData<R, M>(obj)) {
      const cellChange: Table.CellChange<R[keyof R]> | undefined = getKeyValue<
        { [key in keyof R]?: Table.CellChange<R[key]> },
        keyof R
      >(this.field)(obj);
      if (cellChange !== undefined) {
        return cellChange.newValue;
      }
      return undefined;
    } else if (isRow<R, M>(obj)) {
      return getKeyValue<R, keyof R>(this.field)(obj);
    } else {
      return getKeyValue<M, keyof M>(this.field)(obj);
    }
  }
}

export class SplitManagedField<R extends Table.Row, M extends Model>
  extends BaseManagedField<R, M>
  implements SplitManagedFieldConfig<R, M> {
  readonly modelField: keyof M;
  readonly rowField: keyof R;

  constructor(config: SplitManagedFieldConfig<R, M>) {
    super(config);
    this.modelField = config.modelField;
    this.rowField = config.rowField;
  }

  /* eslint-disable no-dupe-class-members */
  public getRawValue(obj: R): R[keyof R] | undefined;
  public getRawValue(obj: M): M[keyof M] | undefined;
  public getRawValue(obj: Table.RowChange<R>): R[keyof R] | undefined;
  public getRawValue(obj: Table.RowChangeData<R>): R[keyof R] | undefined;

  // TODO: Intelligently cast return type to either R[keyof R] | undefined OR M[keyof M] | undefined.
  public getRawValue(obj: R | M | Table.RowChange<R> | Table.RowChangeData<R>): R[keyof R] | M[keyof M] | undefined {
    if (isRowChange<R, M>(obj)) {
      const data: { [key in keyof R]?: Table.CellChange<R[key]> } = obj.data;
      return this.getRawValue(data);
    } else if (isRowChangeData<R, M>(obj)) {
      const cellChange: Table.CellChange<R[keyof R]> | undefined = getKeyValue<
        { [key in keyof R]?: Table.CellChange<R[key]> },
        keyof R
      >(this.rowField)(obj);
      if (cellChange !== undefined) {
        return cellChange.newValue;
      }
      return undefined;
    } else if (isRow<R, M>(obj)) {
      return getKeyValue<R, keyof R>(this.rowField)(obj);
    } else {
      return getKeyValue<M, keyof M>(this.modelField)(obj);
    }
  }
}

const isSplitField = <R extends Table.Row, M extends Model>(
  field: ManagedField<R, M>
): field is SplitManagedField<R, M> => {
  return (field as SplitManagedField<R, M>).modelField !== undefined;
};

type ManagedField<R extends Table.Row, M extends Model> = SplitManagedField<R, M> | AgnosticManagedField<R, M>;

const ManageField = <R extends Table.Row, M extends Model>(config: ManagedFieldConfig<R, M>) => {
  if (isSplitConfig(config)) {
    return new SplitManagedField<R, M>(config);
  }
  return new AgnosticManagedField<R, M>(config);
};

export interface RowManagerConfig<
  R extends Table.Row<G, C>,
  M extends Model = Model,
  G extends IGroup<any> = IGroup<any>,
  C extends Model = Model
> {
  readonly fields: ManagedField<R, M>[];
  readonly childrenGetter?: ((model: M) => C[]) | string | null;
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
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.ModelPayload<M>,
  C extends Model = Model
> implements RowManagerConfig<R, M, G, C> {
  public fields: ManagedField<R, M>[];
  public childrenGetter?: ((model: M) => C[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;
  public rowType: Table.RowType;

  constructor(config: RowManagerConfig<R, M, G, C>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
    this.rowType = config.rowType;
  }

  getChildren = (model: M): C[] => {
    if (typeof this.childrenGetter === "string") {
      const children: any = model[this.childrenGetter as keyof M];
      if (!isNil(children)) {
        return children as C[];
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

  getGroup = (model: M): number | null => {
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

  createPlaceholder = (): R => {
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
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (isSplitField(field)) {
        obj[field.rowField] = field.placeholderValue || null;
      } else {
        obj[field.field] = field.placeholderValue || null;
      }
    });
    return obj as R;
  };

  modelToRow = (model: M, group: G | null, meta: Partial<Table.RowMeta<C>> = {}): R => {
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
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (field.inRow !== false) {
        if (isSplitField(field)) {
          obj[field.rowField] = field.getValueFromModel(model) as R[keyof R];
        } else {
          obj[field.field] = field.getValueFromModel(model) as R[keyof M & keyof R];
        }
      }
    });
    return obj as R;
  };

  // TODO: Figure out how to combine mergeChangesWithRow and mergeChangesWithModel into
  // a single mergeChanges method that is typed with overloads.
  mergeChangesWithRow = (obj: R, change: Table.RowChange<R>): R => {
    const row: R = { ...obj };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      const v = field.getRawValue(change) as R[keyof R] | R[keyof M & keyof R] | undefined;
      if (v !== undefined) {
        if (isSplitField(field)) {
          row[field.rowField] = v;
        } else {
          row[field.field] = v as R[keyof R & keyof M];
        }
      }
    });
    return row;
  };

  mergeChangesWithModel = (obj: M, change: Table.RowChange<R>): M => {
    const model: M = { ...obj };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      const v = field.getRawValue(change) as M[keyof M] | M[keyof M & keyof R] | undefined;
      if (v !== undefined) {
        if (isSplitField(field)) {
          model[field.modelField] = v;
        } else {
          model[field.field] = v as M[keyof M & keyof R];
        }
      }
    });
    return model;
  };

  payload = <T extends R | Table.RowChange<R>>(row: T): PayloadType<T, P, R> => {
    // TODO: It would be great if we can type this better, but we have to find some relationship
    // between M & P (I thought that Http.ModelPayload would do the trick).
    const obj: { [key in keyof M]?: any } = {};
    const method: Http.Method = isRowChange(row) ? "PATCH" : "POST";

    const setValue = (field: ManagedField<R, M>, key: keyof M, value: R[keyof R] | M[keyof M] | undefined): void => {
      if (value !== undefined) {
        if (value === null) {
          if (field.allowNull === true) {
            obj[key] = value;
          }
        } else if ((value as any) === "") {
          if (field.allowBlank === true) {
            obj[key] = "";
          }
        } else {
          obj[key] = value;
        }
      }
    };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (isSplitField(field)) {
        const httpValue = field.getHttpValue(row, method);
        setValue(field, field.modelField, httpValue);
      } else {
        const httpValue = field.getHttpValue(row, method);
        setValue(field, field.field, httpValue);
      }
    });
    return obj as PayloadType<T, P, R>;
  };

  rowHasRequiredFields = (row: R): boolean => {
    let requiredFieldsPresent = true;
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (field.required === true) {
        const value = field.getValueFromRow(row);
        if (isNil(value) || (value as any) === "") {
          requiredFieldsPresent = false;
          return false;
        }
      }
    });
    return requiredFieldsPresent;
  };
}

export const AccountRowManager = new RowManager<
  Table.AccountRow,
  IAccount,
  IGroup<ISimpleAccount>,
  Http.IAccountPayload,
  ISimpleSubAccount
>({
  fields: [
    ManageField({ field: "description" }),
    // We want to attribute the full group to the row, not just the ID.
    ManageField({ field: "group", allowNull: true, inRow: false }),
    ManageField({ field: "identifier", required: true }),
    ManageField({ field: "estimated", readOnly: true }),
    ManageField({ field: "variance", readOnly: true }),
    ManageField({ field: "actual", readOnly: true })
  ],
  childrenGetter: (model: IAccount) => model.subaccounts,
  groupGetter: (model: IAccount) => model.group,
  labelGetter: (model: IAccount) => model.identifier,
  typeLabel: "Account",
  rowType: "account"
});

export const SubAccountRowManager = new RowManager<
  Table.SubAccountRow,
  ISubAccount,
  IGroup<ISimpleSubAccount>,
  Http.ISubAccountPayload,
  ISimpleSubAccount
>({
  fields: [
    ManageField({ field: "description", allowBlank: true }),
    ManageField({ field: "name", allowBlank: true }),
    // We want to attribute the full group to the row, not just the ID.
    ManageField({ field: "group", allowNull: true, inRow: false }),
    ManageField({ field: "quantity", allowNull: true }),
    ManageField({ field: "rate", allowNull: true }),
    ManageField({ field: "multiplier", allowNull: true }),
    ManageField({
      field: "unit",
      allowNull: true,
      setter: (model: ISubAccount): SubAccountUnitName | null => (!isNil(model.unit) ? model.unit.name : null),
      httpGetter: (value: any): number | null | undefined => {
        if (value !== null) {
          const model = findChoiceModelForName(SubAccountUnits, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted sub-account unit name ${value} in table data.`);
            return undefined;
          }
          return model.id;
        }
        return null;
      }
    }),
    ManageField({ field: "identifier", required: true }),
    ManageField({ field: "estimated", readOnly: true }),
    ManageField({ field: "variance", readOnly: true }),
    ManageField({ field: "actual", readOnly: true }),
    ManageField({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: ISubAccount) => model.subaccounts,
  groupGetter: (model: ISubAccount) => model.group,
  labelGetter: (model: ISubAccount) => model.identifier,
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<Table.ActualRow, IActual, IGroup<any>, Http.IActualPayload>({
  fields: [
    ManageField({ field: "description" }),
    ManageField({
      field: "object_id",
      http: ["PATCH"],
      required: true
    }),
    ManageField({
      field: "parent_type",
      http: ["PATCH"],
      required: true
    }),
    ManageField({ field: "vendor" }),
    ManageField({ field: "purchase_order" }),
    ManageField({ field: "date" }),
    ManageField({ field: "payment_method" }),
    ManageField({ field: "payment_id" }),
    ManageField({ field: "value" })
  ],
  labelGetter: (model: IActual) => String(model.object_id),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<Table.FringeRow, IFringe, IGroup<any>, Http.IFringePayload>({
  fields: [
    ManageField({ field: "name", required: true }),
    ManageField({ field: "description", allowNull: true }),
    ManageField({ field: "cutoff", allowNull: true }),
    ManageField({ field: "rate", allowNull: true }),
    ManageField({ field: "unit", allowNull: true })
  ],
  labelGetter: (model: IFringe) => String(model.name),
  typeLabel: "Fringe",
  rowType: "fringe"
});

export default RowManager;
