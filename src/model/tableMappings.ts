import { forEach, isNil, map, filter } from "lodash";
import { generateRandomNumericId } from "util/math";

export interface MappedField<M extends Model> {
  field: keyof M;
  requiredForPost?: boolean;
  calculatedField?: boolean;
  usedToCalculate?: boolean;
  updateBeforeRequest?: boolean;
  excludeFromPost?: boolean;
}

interface MappingConfig<
  M extends Model,
  G extends Table.RowGroup = Table.RowGroup,
  C extends Table.RowChild = Table.RowChild
> {
  readonly fields: MappedField<M>[];
  readonly childrenGetter?: ((model: M) => C[]) | string | null;
  readonly groupGetter?: ((model: M) => G | null) | string | null;
}

function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]; // Inferred type is T[K]
}

class Mapping<
  R extends Table.Row<G, C>,
  M extends Model,
  P extends Http.IPayload,
  C extends Table.RowChild = Table.RowChild,
  G extends Table.RowGroup = Table.RowGroup
> implements MappingConfig<M, G, C> {
  public fields: MappedField<M>[];
  public childrenGetter?: ((model: M) => C[]) | string | null;
  public groupGetter?: ((model: M) => G | null) | string | null;

  constructor(config: MappingConfig<M, G, C>) {
    this.fields = config.fields;
    this.childrenGetter = config.childrenGetter;
    this.groupGetter = config.groupGetter;
  }

  _getChildren = (model: M): C[] => {
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

  _getGroup = (model: M): G | null => {
    if (this.groupGetter === null) {
      return null;
    } else if (typeof this.groupGetter === "string") {
      const group: any = model[this.groupGetter as keyof M];
      if (group !== undefined) {
        return group as G;
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
      isPlaceholder: false,
      isGroupFooter: false,
      isTableFooter: false,
      selected: false,
      children: [],
      errors: []
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

  modelToRow = (model: M): R => {
    const meta: Table.RowMeta<C> = {
      isPlaceholder: false,
      isGroupFooter: false,
      isTableFooter: false,
      selected: false,
      children: this._getChildren(model),
      errors: []
    };
    const obj: { [key: string]: any } = {
      id: model.id,
      meta,
      group: this._getGroup(model)
    };
    forEach(this.fields, (field: MappedField<M>) => {
      obj[field.field as string] = getProperty<M, keyof M>(model, field.field);
    });
    return obj as R;
  };

  partialModelToRowUpdate = (model: Partial<M>): Partial<R> => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: MappedField<M>) => {
      obj[field.field as string] = getProperty<Partial<M>, keyof M>(model, field.field);
    });
    return obj as R;
  };

  postPayload = (row: R): P => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: MappedField<M>) => {
      if (field.calculatedField === false && !(field.excludeFromPost === true) && !isNil(row[field.field as keyof R])) {
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

  preRequestPayload = (payload: Table.RowChange): Partial<R> => {
    const obj: { [key: string]: any } = {};
    forEach(this.fields, (field: MappedField<M>) => {
      if (field.updateBeforeRequest === true && !isNil(payload.data[field.field as string])) {
        obj[field.field as string] = payload.data[field.field as string].newValue;
      }
    });
    return obj as Partial<R>;
  };

  patchRequestRequiresRecalculation = (data: Partial<P>): boolean => {
    let recalculationRequired = false;
    const fieldsUsedToCalculate = map(
      filter(this.fields, (field: MappedField<M>) => field.usedToCalculate === true),
      (field: MappedField<M>) => field.field
    );
    forEach(fieldsUsedToCalculate, (field: keyof M) => {
      if (!isNil(data[field as keyof Partial<P>])) {
        recalculationRequired = true;
        return false;
      }
    });
    return recalculationRequired;
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

export const AccountMapping = new Mapping<Table.AccountRow, IAccount, Http.IAccountPayload, ISimpleSubAccount>({
  fields: [
    { field: "description" },
    { field: "identifier", requiredForPost: true },
    { field: "estimated", calculatedField: true },
    { field: "variance", calculatedField: true },
    { field: "actual", calculatedField: true }
  ],
  childrenGetter: (model: IAccount) => model.subaccounts
});

export const SubAccountMapping = new Mapping<
  Table.SubAccountRow,
  ISubAccount,
  Http.ISubAccountPayload,
  ISimpleSubAccount,
  ISubAccountNestedGroup
>({
  fields: [
    { field: "description" },
    { field: "name" },
    { field: "quantity", usedToCalculate: true },
    { field: "rate", usedToCalculate: true },
    { field: "multiplier", usedToCalculate: true },
    { field: "unit", updateBeforeRequest: true },
    { field: "identifier", requiredForPost: true },
    { field: "estimated", calculatedField: true }
  ],
  childrenGetter: (model: ISubAccount) => model.subaccounts,
  groupGetter: (model: ISubAccount) => model.group
});

export const ActualMapping = new Mapping<Table.ActualRow, IActual, Http.IActualPayload>({
  fields: [
    { field: "description" },
    {
      field: "object_id",
      excludeFromPost: true,
      requiredForPost: true,
      updateBeforeRequest: true
    },
    {
      field: "parent_type",
      excludeFromPost: true,
      requiredForPost: true,
      updateBeforeRequest: true
    },
    { field: "vendor" },
    { field: "purchase_order" },
    { field: "date" },
    { field: "payment_method", updateBeforeRequest: true },
    { field: "payment_id" },
    { field: "value" }
  ]
});

export default Mapping;