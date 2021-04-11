import { forEach, isNil } from "lodash";
import { generateRandomNumericId, getKeyValue } from "lib/util";

export interface ManagedFieldConfig<R, M extends Model> {
  readonly field: keyof M;
  readonly required?: boolean;
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly excludeFromPost?: boolean;
  readonly http?: boolean;
  readonly placeholderValue?: any;
  readonly inRow?: boolean;
  readonly setter?: (model: M) => R[keyof R];
}

export class ManagedField<R, M extends Model> implements ManagedFieldConfig<R, M> {
  readonly field: keyof M;
  readonly required?: boolean;
  readonly allowNull?: boolean;
  readonly allowBlank?: boolean;
  readonly excludeFromPost?: boolean;
  readonly http?: boolean;
  readonly placeholderValue?: any;
  readonly inRow?: boolean;
  readonly setter?: (model: M) => R[keyof R];

  constructor(config: ManagedFieldConfig<R, M>) {
    this.field = config.field;
    this.required = config.required;
    this.allowBlank = config.allowBlank;
    this.allowNull = config.allowNull;
    this.excludeFromPost = config.excludeFromPost;
    this.http = config.http;
    this.placeholderValue = config.placeholderValue;
    this.inRow = config.inRow;
    this.setter = config.setter;
  }

  getRowValue = (model: M) => {
    if (!isNil(this.setter)) {
      return this.setter(model);
    }
    return getKeyValue<M, keyof M>(this.field)(model);
  };
}

export interface RowManagerConfig<
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  C extends Model = UnknownModel
> {
  readonly fields: ManagedField<R, M>[];
  readonly childrenGetter?: ((model: M) => C[]) | string | null;
  readonly groupGetter?: ((model: M) => number | null) | string | null;
  readonly typeLabel: string;
  readonly rowType: Table.RowType;
  readonly labelGetter: (model: M) => string;
}

class RowManager<
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload,
  C extends Model = UnknownModel
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
    const meta: Table.RowMeta<C> = {
      isPlaceholder: true,
      isGroupFooter: false,
      isTableFooter: false,
      isBudgetFooter: false,
      selected: false,
      children: [],
      errors: [],
      label: "Placeholder",
      typeLabel: this.typeLabel,
      fieldsLoading: [],
      type: this.rowType
    };
    const obj: { [key: string]: any } = {
      id: generateRandomNumericId(),
      meta,
      group: null
    };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      obj[field.field as string] = field.placeholderValue || null;
    });
    return obj as R;
  };

  modelToRow = (model: M, group: G | null, meta: Partial<Table.RowMeta<C>> = {}): R => {
    const fullMeta: Table.RowMeta<C> = {
      isPlaceholder: false,
      isGroupFooter: false,
      isTableFooter: false,
      isBudgetFooter: false,
      selected: false,
      children: this.getChildren(model),
      errors: [],
      label: this.labelGetter(model),
      typeLabel: this.typeLabel,
      fieldsLoading: [],
      type: this.rowType,
      ...meta
    };
    const obj: { [key: string]: any } = {
      id: model.id,
      meta: fullMeta,
      group
    };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (field.inRow !== false) {
        obj[field.field as string] = field.getRowValue(model);
      }
    });
    return obj as R;
  };

  newRowWithChanges = (row: R, change: Table.RowChange): R => {
    const obj: R = { ...row };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (change.data[field.field as string] !== undefined) {
        obj[field.field as keyof R] = change.data[field.field as string].newValue as any;
      }
    });
    return obj;
  };

  newModelWithChanges = (model: M, change: Table.RowChange): M => {
    const obj: M = { ...model };
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (change.data[field.field as string] !== undefined) {
        obj[field.field as keyof M] = change.data[field.field as string].newValue as any;
      }
    });
    return obj;
  };

  postPayload = (row: R): P => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (!(field.http === false) && !(field.excludeFromPost === true)) {
        const value = row[field.field as keyof R] as any;
        if (value !== undefined) {
          if (value === null) {
            if (field.allowNull === true) {
              obj[field.field as string] = null;
            }
          } else if (value === "") {
            if (field.allowBlank === true) {
              obj[field.field as string] = "";
            }
          } else {
            obj[field.field as string] = value;
          }
        }
      }
    });
    return obj as P;
  };

  patchPayload = (payload: Table.RowChange): Partial<P> => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (!(field.http === false) && !isNil(payload.data[field.field as string])) {
        const value = payload.data[field.field as string].newValue;
        if (value !== undefined) {
          if (value === null) {
            if (field.allowNull === true) {
              obj[field.field as string] = null;
            }
          } else if (value === "") {
            if (field.allowBlank === true) {
              obj[field.field as string] = "";
            }
          } else {
            obj[field.field as string] = value;
          }
        }
      }
    });
    return obj as Partial<P>;
  };

  rowHasRequiredFields = (row: R): boolean => {
    let requiredFieldsPresent = true;
    forEach(this.fields, (field: ManagedField<R, M>) => {
      if (field.required === true) {
        const val = row[field.field as keyof R] as any;
        if (isNil(val) || val === "") {
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
    new ManagedField({ field: "description" }),
    // We want to attribute the full group to the row, not just the ID.
    new ManagedField({ field: "group", allowNull: true, inRow: false }),
    new ManagedField({ field: "identifier", required: true }),
    new ManagedField({ field: "estimated", http: false }),
    new ManagedField({ field: "variance", http: false }),
    new ManagedField({ field: "actual", http: false })
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
    new ManagedField({ field: "description", allowBlank: true }),
    new ManagedField({ field: "name", allowBlank: true }),
    // We want to attribute the full group to the row, not just the ID.
    new ManagedField({ field: "group", allowNull: true, inRow: false }),
    new ManagedField({ field: "quantity", allowNull: true }),
    new ManagedField({ field: "rate", allowNull: true }),
    new ManagedField({ field: "multiplier", allowNull: true }),
    new ManagedField({
      field: "unit",
      allowNull: true,
      setter: (model: ISubAccount): SubAccountUnitName | null => (!isNil(model.unit) ? model.unit.name : null)
    }),
    new ManagedField({ field: "identifier", required: true }),
    new ManagedField({ field: "estimated", http: false }),
    new ManagedField({ field: "variance", http: false }),
    new ManagedField({ field: "actual", http: false }),
    new ManagedField({ field: "fringes", allowNull: true, placeholderValue: [] })
  ],
  childrenGetter: (model: ISubAccount) => model.subaccounts,
  groupGetter: (model: ISubAccount) => model.group,
  labelGetter: (model: ISubAccount) => model.identifier,
  typeLabel: "Sub Account",
  rowType: "subaccount"
});

export const ActualRowManager = new RowManager<Table.ActualRow, IActual, IGroup<any>, Http.IActualPayload>({
  fields: [
    new ManagedField({ field: "description" }),
    new ManagedField({
      field: "object_id",
      excludeFromPost: true,
      required: true
    }),
    new ManagedField({
      field: "parent_type",
      excludeFromPost: true,
      required: true
    }),
    new ManagedField({ field: "vendor" }),
    new ManagedField({ field: "purchase_order" }),
    new ManagedField({ field: "date" }),
    new ManagedField({ field: "payment_method" }),
    new ManagedField({ field: "payment_id" }),
    new ManagedField({ field: "value" })
  ],
  labelGetter: (model: IActual) => String(model.object_id),
  typeLabel: "Actual",
  rowType: "actual"
});

export const FringeRowManager = new RowManager<Table.FringeRow, IFringe, IGroup<any>, Http.IFringePayload>({
  fields: [
    new ManagedField({ field: "name", required: true }),
    new ManagedField({ field: "description", allowNull: true }),
    new ManagedField({ field: "cutoff", allowNull: true }),
    new ManagedField({ field: "rate", allowNull: true }),
    new ManagedField({ field: "unit", allowNull: true })
  ],
  labelGetter: (model: IFringe) => String(model.name),
  typeLabel: "Fringe",
  rowType: "fringe"
});

export default RowManager;
