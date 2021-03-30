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
      typeLabel: this.typeLabel
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
      if (
        !(field.calculatedField === true) &&
        !(field.excludeFromPost === true) &&
        !isNil(row[field.field as keyof R])
      ) {
        obj[field.field as string] = row[field.field as keyof R];
      }
    });
    return obj as P;
  };

  patchPayload = (payload: Table.RowChange): Partial<P> => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: MappedField<M>) => {
      if (!isNil(payload.data[field.field as string])) {
        obj[field.field as string] = payload.data[field.field as string].newValue;
      }
    });
    return obj as Partial<P>;
  };

  rowHasRequiredFields = (row: R): boolean => {
    let requiredFieldsPresent = true;
    forEach(this.fields, (field: MappedField<M>) => {
      if (field.requiredForPost === true) {
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
    { field: "identifier", requiredForPost: true },
    { field: "estimated", calculatedField: true },
    { field: "variance", calculatedField: true },
    { field: "actual", calculatedField: true }
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
    { field: "description" },
    { field: "name" },
    { field: "group" },
    { field: "quantity", usedToCalculate: true },
    { field: "rate", usedToCalculate: true },
    { field: "multiplier", usedToCalculate: true },
    { field: "unit" },
    { field: "identifier", requiredForPost: true },
    { field: "estimated", calculatedField: true },
    { field: "variance", calculatedField: true },
    { field: "actual", calculatedField: true }
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
      requiredForPost: true
    },
    {
      field: "parent_type",
      excludeFromPost: true,
      requiredForPost: true
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

export default Mapping;
