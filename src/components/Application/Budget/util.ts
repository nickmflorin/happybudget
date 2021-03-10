import { isNil, forEach } from "lodash";

interface FieldDefinition<F> {
  name: F;
  payload?: boolean;
  required?: boolean;
  response?: boolean;
}

const FieldDefinitions: { [key in Table.RowType]: FieldDefinition<string>[] } = {
  actual: [
    { name: "description", payload: true },
    { name: "parent", payload: false, required: true },
    { name: "vendor", payload: true },
    { name: "purchase_order", payload: true },
    { name: "date", payload: true },
    { name: "payment_method", payload: true },
    { name: "payment_id", payload: true },
    { name: "value", payload: true }
  ],
  subaccount: [
    { name: "description", payload: true },
    { name: "name", payload: true, required: true },
    { name: "quantity", payload: true },
    { name: "rate", payload: true },
    { name: "multiplier", payload: true },
    { name: "unit", payload: true },
    { name: "line", payload: true, required: true },
    { name: "estimated", response: true }
  ],
  account: [
    { name: "description", payload: true },
    { name: "account_number", payload: true, required: true },
    { name: "estimated", response: true },
    { name: "variance", response: true },
    { name: "actual", response: true }
  ]
};

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const payloadFromRow = <R, P>(row: R, type: Table.RowType): P => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: FieldDefinition<string>) => {
    if (def.payload === true && !isNil(row[def.name as keyof R])) {
      obj[def.name] = row[def.name as keyof R];
    }
  });
  return obj as P;
};

export const payloadFromResponse = <M>(model: M, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: FieldDefinition<string>) => {
    if (def.response === true) {
      obj[def.name] = model[def.name as keyof M];
    }
  });
  return obj;
};

export const rowHasRequiredFields = <R extends { [key: string]: any }>(row: R, type: Table.RowType): boolean => {
  let requiredFieldsPresent = true;
  const fieldDefs = FieldDefinitions[type] as FieldDefinition<any>[];
  forEach(fieldDefs, (def: FieldDefinition<any>) => {
    if (def.required === true) {
      const val = row[def.name];
      if (isNil(val) || val === "") {
        requiredFieldsPresent = false;
        return false;
      }
    }
  });
  return requiredFieldsPresent;
};

export const initializeRowFromAccount = (account: IAccount): Table.IAccountRow => ({
  id: account.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: account.subaccounts,
    errors: []
  },
  account_number: account.account_number,
  description: account.description,
  estimated: account.estimated,
  variance: account.variance
});

export const initializeRowFromActual = (actual: IActual): Table.IActualRow => ({
  id: actual.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    errors: []
  },
  description: actual.description,
  vendor: actual.vendor,
  purchase_order: actual.purchase_order,
  date: actual.date,
  payment_id: actual.payment_id,
  value: actual.value,
  payment_method: actual.payment_method,
  parent: actual.parent
});

export const initializeRowFromSubAccount = (subaccount: ISubAccount): Table.ISubAccountRow => ({
  id: subaccount.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: subaccount.subaccounts,
    errors: []
  },
  name: subaccount.name,
  line: subaccount.line,
  unit: subaccount.unit,
  multiplier: subaccount.multiplier,
  rate: subaccount.rate,
  quantity: subaccount.quantity,
  description: subaccount.description,
  estimated: subaccount.estimated,
  variance: subaccount.variance
});

export const createActualRowPlaceholder = (): Table.IActualRow => ({
  id: generateRandomNumericId(),
  meta: {
    isPlaceholder: true,
    selected: false,
    errors: []
  },
  description: null,
  vendor: null,
  purchase_order: null,
  date: null,
  payment_id: null,
  value: null,
  payment_method: null,
  parent: null
});

export const createSubAccountRowPlaceholder = (): Table.ISubAccountRow => ({
  id: generateRandomNumericId(),
  name: null,
  line: null,
  unit: null,
  multiplier: null,
  rate: null,
  quantity: null,
  description: null,
  estimated: null,
  variance: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});

export const createAccountRowPlaceholder = (): Table.IAccountRow => ({
  id: generateRandomNumericId(),
  account_number: null,
  description: null,
  estimated: null,
  variance: null,
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: [],
    errors: []
  }
});
