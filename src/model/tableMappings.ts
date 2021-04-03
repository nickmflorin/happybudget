import { forEach, isNil } from "lodash";
import { generateRandomNumericId } from "util/math";

function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]; // Inferred type is T[K]
}

class Mapping<
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload,
  C extends Model = UnknownModel
> implements MappingConfig<M, C> {
  public fields: MappedField<M>[];
  public childrenGetter?: ((model: M) => C[]) | string | null;
  public groupGetter?: ((model: M) => number | null) | string | null;
  public labelGetter: (model: M) => string;
  public typeLabel: string;

  constructor(config: MappingConfig<M, C>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
    this.labelGetter = config.labelGetter;
    this.typeLabel = config.typeLabel;
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
      fieldsLoading: []
    };
    const obj: { [key: string]: any } = {
      id: generateRandomNumericId(),
      meta,
      group: null
    };
    forEach(this.fields, (field: MappedField<M>) => {
      obj[field.field as string] = null;
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
      ...meta
    };
    const obj: { [key: string]: any } = {
      id: model.id,
      meta: fullMeta,
      group
    };
    forEach(this.fields, (field: MappedField<M>) => {
      // We want to attribute the full group to the row, not just the ID.
      if (field.field !== "group") {
        obj[field.field as string] = getProperty<M, keyof M>(model, field.field);
      }
    });
    return obj as R;
  };

  newRowWithChanges = (row: R, change: Table.RowChange): R => {
    const obj: R = { ...row };
    forEach(this.fields, (field: MappedField<M>) => {
      if (change.data[field.field as string] !== undefined) {
        obj[field.field as keyof R] = change.data[field.field as string].newValue as any;
      }
    });
    return obj;
  };

  newModelWithChanges = (model: M, change: Table.RowChange): M => {
    const obj: M = { ...model };
    forEach(this.fields, (field: MappedField<M>) => {
      if (change.data[field.field as string] !== undefined) {
        obj[field.field as keyof M] = change.data[field.field as string].newValue as any;
      }
    });
    return obj;
  };

  postPayload = (row: R): P => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: MappedField<M>) => {
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
    forEach(this.fields, (field: MappedField<M>) => {
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
    forEach(this.fields, (field: MappedField<M>) => {
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

export const AccountMapping = new Mapping<
  Table.AccountRow,
  IAccount,
  IGroup<ISimpleAccount>,
  Http.IAccountPayload,
  ISimpleSubAccount
>({
  fields: [
    { field: "description" },
    { field: "group" },
    { field: "identifier", required: true },
    { field: "estimated", http: false },
    { field: "variance", http: false },
    { field: "actual", http: false }
  ],
  childrenGetter: (model: IAccount) => model.subaccounts,
  groupGetter: (model: IAccount) => model.group,
  labelGetter: (model: IAccount) => model.identifier,
  typeLabel: "Account"
});

export const SubAccountMapping = new Mapping<
  Table.SubAccountRow,
  ISubAccount,
  IGroup<ISimpleSubAccount>,
  Http.ISubAccountPayload,
  ISimpleSubAccount
>({
  fields: [
    { field: "description", allowBlank: true },
    { field: "name", allowBlank: true },
    { field: "group", allowNull: true },
    { field: "quantity", allowNull: true },
    { field: "rate", allowNull: true },
    { field: "multiplier", allowNull: true },
    { field: "unit", allowNull: true },
    { field: "identifier", required: true },
    { field: "estimated", http: false },
    { field: "variance", http: false },
    { field: "actual", http: false }
  ],
  childrenGetter: (model: ISubAccount) => model.subaccounts,
  groupGetter: (model: ISubAccount) => model.group,
  labelGetter: (model: ISubAccount) => model.identifier,
  typeLabel: "Sub Account"
});

export const ActualMapping = new Mapping<Table.ActualRow, IActual, IGroup<any>, Http.IActualPayload>({
  fields: [
    { field: "description" },
    {
      field: "object_id",
      excludeFromPost: true,
      required: true
    },
    {
      field: "parent_type",
      excludeFromPost: true,
      required: true
    },
    { field: "vendor" },
    { field: "purchase_order" },
    { field: "date" },
    { field: "payment_method" },
    { field: "payment_id" },
    { field: "value" }
  ],
  labelGetter: (model: IActual) => String(model.object_id),
  typeLabel: "Actual"
});

export const FringeMapping = new Mapping<Table.FringeRow, IFringe, IGroup<any>, Http.IFringePayload>({
  fields: [
    { field: "name", required: true },
    { field: "description", allowNull: true },
    { field: "cutoff", allowNull: true },
    { field: "rate", allowNull: true },
    { field: "unit", allowNull: true }
  ],
  labelGetter: (model: IFringe) => String(model.name),
  typeLabel: "Fringe"
});

export default Mapping;
