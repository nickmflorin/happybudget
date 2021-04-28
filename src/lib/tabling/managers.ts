import { forEach, isNil, includes, find } from "lodash";
import { generateRandomNumericId, getKeyValue } from "lib/util";
import { SubAccountUnits, PaymentMethods, FringeUnits } from "lib/model";
import { findChoiceForName } from "lib/model/util";
import { isRowChange, isRow, isRowChangeData, isModel } from "./typeguards";

type BaseFieldConfig<R extends Table.Row, M extends Model.Model> = {
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
  // pair on the row (R) model.  Note - typing this as (value: M[keyof M]) seems to
  // cause problems - we should figure that out.
  readonly modelValueConverter?: (value: any, field: BaseManagedField<R, M>) => R[keyof R];
  // Used to translate a field-value pair on the row (R) model to a field-value
  // pair on the model (M) model.  Note - typing this as (value: R[keyof R]) seems to
  // cause problems - we should figure that out.
  readonly rowValueConverter?: (value: any, field: BaseManagedField<R, M>) => M[keyof M];
  // Used to transform a value that is on the row (R) model to a value that is
  // included in the HTTP PATCH or POST payloads.
  readonly httpValueConverter?: (value: R[keyof R], field: BaseManagedField<R, M>) => M[keyof M] | undefined;
  // Used to transform a value that is on the row (R) model to a value that is
  // stored in the clipboard on copy operations.  Note - typing this as (value: R[keyof R]) seems to
  // cause problems - we should figure that out.
  readonly clipboardValueConverter?: (value: any, field: BaseManagedField<R, M>) => any;
};

type SplitManagedFieldConfig<R extends Table.Row, M extends Model.Model> = BaseFieldConfig<R, M> & {
  // The name of the field on the model (M) model that the field configuration
  // corresponds to.
  readonly modelField: keyof M;
  // The name of the field on the row (R) model that the field configuration
  // corresponds to.
  readonly rowField: keyof R;
};

type AgnosticManagedFieldConfig<R extends Table.Row, M extends Model.Model> = BaseFieldConfig<R, M> & {
  // The name of the field on both the row (R) model and model (M) model that the
  // field configuration corresponds to.
  readonly field: keyof M & keyof R;
};

type ManagedFieldConfig<R extends Table.Row, M extends Model.Model> =
  | SplitManagedFieldConfig<R, M>
  | AgnosticManagedFieldConfig<R, M>;

const isSplitConfig = <R extends Table.Row, M extends Model.Model>(
  config: ManagedFieldConfig<R, M>
): config is SplitManagedFieldConfig<R, M> => {
  return (config as SplitManagedFieldConfig<R, M>).modelField !== undefined;
};

type PayloadType<T, P, R extends Table.Row> = T extends Table.RowChange<R> ? Partial<P> : P;
type ObjType<R extends Table.Row, M extends Model.Model> = R | M | Table.RowChange<R> | Table.RowChangeData<R>;

abstract class BaseManagedField<R extends Table.Row, M extends Model.Model> {
  readonly required?: boolean;
  readonly readOnly?: boolean;
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly http: Http.Method[];
  readonly placeholderValue?: any;
  readonly inRow?: boolean;
  readonly modelValueConverter?: (value: M[keyof M], field: BaseManagedField<R, M>) => R[keyof R];
  readonly rowValueConverter?: (value: R[keyof R], field: BaseManagedField<R, M>) => M[keyof M];
  readonly httpValueConverter?: (value: R[keyof R], field: BaseManagedField<R, M>) => M[keyof M] | undefined;
  readonly clipboardValueConverter?: (value: R[keyof R], field: BaseManagedField<R, M>) => any;

  constructor(config: ManagedFieldConfig<R, M>) {
    this.required = config.required;
    this.readOnly = config.readOnly;
    this.allowBlank = config.allowBlank;
    this.allowNull = config.allowNull;
    this.http = config.http || ["POST", "PATCH"];
    this.placeholderValue = config.placeholderValue;
    this.inRow = config.inRow;
    this.rowValueConverter = config.rowValueConverter;
    this.modelValueConverter = config.modelValueConverter;
    this.httpValueConverter = config.httpValueConverter;
    this.clipboardValueConverter = config.clipboardValueConverter;
  }

  public abstract getRawValue(obj: ObjType<R, M>): R[keyof R] | M[keyof M] | undefined;

  public getClipboardValue(row: R): any {
    const value = this.getRowValue(row) as R[keyof R] | undefined;
    if (!isNil(this.clipboardValueConverter) && value !== undefined) {
      return this.clipboardValueConverter(value, this);
    }
    return value;
  }

  public getHttpValue(row: R | Table.RowChange<R>, method?: Http.Method): any {
    if (!isNil(method) && !includes(this.http, method)) {
      return undefined;
    }
    // TODO: See note below about intelligently casting return type to either
    // R[keyof R] | undefined OR M[keyof M] | undefined.  Once that is established,
    // this force coercion will not be necessary anymore.
    const value = this.getRowValue(row) as R[keyof R] | undefined;
    if (!isNil(this.httpValueConverter) && value !== undefined) {
      return this.httpValueConverter(value, this);
    }
    return value;
  }

  public getModelValue(obj: ObjType<R, M>): M[keyof M] | R[keyof M & keyof R] | undefined {
    const value = this.getRawValue(obj);
    if (isModel(obj)) {
      return value as M[keyof M] | undefined;
    }
    if (!isNil(this.rowValueConverter) && value !== undefined) {
      return this.rowValueConverter(value as R[keyof R], this);
    }
    return value as M[keyof M];
  }

  public getRowValue(obj: ObjType<R, M>): R[keyof R] | R[keyof M & keyof R] | undefined {
    const value = this.getRawValue(obj);
    if (!isModel(obj)) {
      return value as R[keyof R] | undefined;
    }
    if (!isNil(this.modelValueConverter) && value !== undefined) {
      return this.modelValueConverter(value as M[keyof M], this);
    }
    return value as R[keyof R];
  }
}

export class AgnosticManagedField<R extends Table.Row, M extends Model.Model>
  extends BaseManagedField<R, M>
  implements AgnosticManagedFieldConfig<R, M> {
  readonly field: keyof M & keyof R;

  constructor(config: AgnosticManagedFieldConfig<R, M>) {
    super(config);
    this.field = config.field;
  }

  // TODO: Intelligently cast return type to either R[keyof R] | undefined OR M[keyof M] | undefined.
  public getRawValue(obj: ObjType<R, M>): R[keyof R] | M[keyof M] | R[keyof M & keyof R] | undefined {
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

export class SplitManagedField<R extends Table.Row, M extends Model.Model>
  extends BaseManagedField<R, M>
  implements SplitManagedFieldConfig<R, M> {
  readonly modelField: keyof M;
  readonly rowField: keyof R;

  constructor(config: SplitManagedFieldConfig<R, M>) {
    super(config);
    this.modelField = config.modelField;
    this.rowField = config.rowField;
  }

  // TODO: Intelligently cast return type to either R[keyof R] | undefined OR M[keyof M] | undefined.
  public getRawValue(obj: ObjType<R, M>): R[keyof R] | M[keyof M] | undefined {
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

const isSplitField = <R extends Table.Row, M extends Model.Model>(
  field: ManagedField<R, M>
): field is SplitManagedField<R, M> => {
  return (field as SplitManagedField<R, M>).modelField !== undefined;
};

type ManagedField<R extends Table.Row, M extends Model.Model> = SplitManagedField<R, M> | AgnosticManagedField<R, M>;

const ManageField = <R extends Table.Row, M extends Model.Model>(config: ManagedFieldConfig<R, M>) => {
  if (isSplitConfig(config)) {
    return new SplitManagedField<R, M>(config);
  }
  return new AgnosticManagedField<R, M>(config);
};

export interface RowManagerConfig<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.BudgetGroup | Model.TemplateGroup
> {
  readonly fields: ManagedField<R, M>[];
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
  G extends Model.BudgetGroup | Model.TemplateGroup,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> implements RowManagerConfig<R, M, G> {
  public fields: ManagedField<R, M>[];
  public childrenGetter?: ((model: M) => number[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;
  public rowType: Table.RowType;

  constructor(config: RowManagerConfig<R, M, G>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
    this.rowType = config.rowType;
  }

  public getField = (name: keyof R | keyof M): ManagedField<R, M> | null => {
    return (
      find(this.fields, (field: ManagedField<R, M>) => {
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
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (isSplitField(field)) {
        obj[field.rowField] = field.placeholderValue || null;
      } else {
        obj[field.field] = field.placeholderValue || null;
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
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (field.inRow !== false) {
        const v = field.getRowValue(model);
        if (v !== undefined) {
          if (isSplitField(field)) {
            obj[field.rowField] = v;
          } else {
            obj[field.field] = v as R[keyof R & keyof M];
          }
        }
      }
    });
    return obj as R;
  };

  // TODO: Figure out how to combine mergeChangesWithRow and mergeChangesWithModel into
  // a single mergeChanges method that is typed with overloads.
  public mergeChangesWithRow = (obj: R, change: Table.RowChange<R>): R => {
    const row: R = { ...obj };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      const v = field.getRowValue(change) as R[keyof R] | R[keyof M & keyof R] | undefined;
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

  public mergeChangesWithModel = (obj: M, change: Table.RowChange<R>): M => {
    const model: M = { ...obj };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      // We have to force coerce R[keyof R] to M[keyof M] because there is no way for TS to
      // understand that the model (M) field name is related to the row (R) field name via the
      // field configurations.
      const v = field.getModelValue(change) as M[keyof M] | M[keyof M & keyof R] | undefined;
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

  public payload = <T extends R | Table.RowChange<R>>(row: T): PayloadType<T, P, R> => {
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
        const value = field.getModelValue(row);
        if (isNil(value) || (value as any) === "") {
          requiredFieldsPresent = false;
          return false;
        }
      }
    });
    return requiredFieldsPresent;
  };
}

export const BudgetAccountRowManager = new RowManager<
  Table.BudgetAccountRow,
  Model.BudgetAccount,
  Model.BudgetGroup,
  Http.BudgetAccountPayload
>({
  fields: [
    ManageField({ field: "description" }),
    // We want to attribute the full group to the row, not just the ID.
    ManageField({ field: "group", allowNull: true, inRow: false }),
    ManageField({ field: "identifier" }),
    ManageField({ field: "estimated", readOnly: true }),
    ManageField({ field: "variance", readOnly: true }),
    ManageField({ field: "actual", readOnly: true })
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
  Model.TemplateGroup,
  Http.TemplateAccountPayload
>({
  fields: [
    ManageField({ field: "description" }),
    // We want to attribute the full group to the row, not just the ID.
    ManageField({ field: "group", allowNull: true, inRow: false }),
    ManageField({ field: "identifier" }),
    ManageField({ field: "estimated", readOnly: true })
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
  Model.BudgetGroup,
  Http.SubAccountPayload
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
      modelValueConverter: (value: Model.SubAccountUnit | null): Model.SubAccountUnitName | null =>
        !isNil(value) ? value.name : null,
      rowValueConverter: (value: Model.SubAccountUnitName | null): Model.SubAccountUnit | null => {
        if (value !== null) {
          const model = findChoiceForName(SubAccountUnits, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted sub-account unit name ${value} in table data.`);
            return null;
          }
          return model;
        }
        return null;
      },
      httpValueConverter: (value: any): number | null | undefined => {
        if (value !== null) {
          const model = findChoiceForName(SubAccountUnits, value);
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
    ManageField({ field: "identifier" }),
    ManageField({ field: "estimated", readOnly: true }),
    ManageField({ field: "variance", readOnly: true }),
    ManageField({ field: "actual", readOnly: true }),
    ManageField({ field: "fringes", allowNull: true, placeholderValue: [] })
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
  Model.TemplateGroup,
  Http.SubAccountPayload
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
      modelValueConverter: (value: Model.SubAccountUnit | null): Model.SubAccountUnitName | null =>
        !isNil(value) ? value.name : null,
      rowValueConverter: (value: Model.SubAccountUnitName | null): Model.SubAccountUnit | null => {
        if (value !== null) {
          const model = findChoiceForName(SubAccountUnits, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted sub-account unit name ${value} in table data.`);
            return null;
          }
          return model;
        }
        return null;
      },
      httpValueConverter: (value: any): number | null | undefined => {
        if (value !== null) {
          const model = findChoiceForName(SubAccountUnits, value);
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
    ManageField({ field: "identifier" }),
    ManageField({ field: "estimated", readOnly: true }),
    ManageField({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: Model.SubAccount) => model.subaccounts,
  groupGetter: (model: Model.SubAccount) => model.group,
  labelGetter: (model: Model.SubAccount) => (!isNil(model.identifier) ? model.identifier : "Sub Account"),
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<Table.ActualRow, Model.Actual, Model.Group, Http.ActualPayload>({
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
    ManageField({
      field: "payment_method",
      modelValueConverter: (value: Model.PaymentMethod | null): Model.PaymentMethodName | null =>
        !isNil(value) ? value.name : null,
      rowValueConverter: (value: Model.PaymentMethodName | null): Model.PaymentMethod | null => {
        if (value !== null) {
          const model = findChoiceForName(PaymentMethods, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted actual payment method name ${value} in table data.`);
            return null;
          }
          return model;
        }
        return null;
      },
      httpValueConverter: (value: any): number | null | undefined => {
        if (value !== null) {
          const model = findChoiceForName(PaymentMethods, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted actual payment method name ${value} in table data.`);
            return undefined;
          }
          return model.id;
        }
        return null;
      }
    }),
    ManageField({ field: "payment_id" }),
    ManageField({ field: "value" })
  ],
  labelGetter: (model: Model.Actual) => String(model.object_id),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<Table.FringeRow, Model.Fringe, Model.Group, Http.FringePayload>({
  fields: [
    ManageField({ field: "name", required: false }),
    ManageField({ field: "description", allowNull: false }),
    ManageField({ field: "cutoff", allowNull: false }),
    ManageField({ field: "rate", allowNull: false }),
    ManageField({
      field: "unit",
      allowNull: false,
      modelValueConverter: (value: Model.FringeUnit | null): Model.FringeUnitName | null =>
        !isNil(value) ? value.name : null,
      rowValueConverter: (value: Model.FringeUnitName | null): Model.FringeUnit | null => {
        if (value !== null) {
          const model = findChoiceForName(FringeUnits, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted fringe unit name ${value} in table data.`);
            return null;
          }
          return model;
        }
        return null;
      },
      httpValueConverter: (value: any): number | null | undefined => {
        if (value !== null) {
          const model = findChoiceForName(FringeUnits, value);
          if (model === null) {
            /* eslint-disable no-console */
            console.error(`Found corrupted fringe unit name ${value} in table data.`);
            return undefined;
          }
          return model.id;
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
