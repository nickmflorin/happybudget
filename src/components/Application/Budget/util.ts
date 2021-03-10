import { isNil, forEach, map, filter } from "lodash";
import { IFieldDefinition, FieldDefinitions } from "./config";

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const postPayloadFromRow = <R, P>(row: R, type: Table.RowType): P => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.postPayload === true && !isNil(row[def.name as keyof R])) {
      obj[def.name] = row[def.name as keyof R];
    }
  });
  return obj as P;
};

export const payloadFromResponse = <M>(model: M, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.responsePayload === true && def.updateBeforeResponse !== true) {
      obj[def.name] = model[def.name as keyof M];
    }
  });
  return obj;
};

export const payloadBeforeResponse = <R>(data: Partial<R>, type: Table.RowType): { [key: string]: any } => {
  const obj: { [key: string]: any } = {};
  forEach(FieldDefinitions[type], (def: IFieldDefinition) => {
    if (def.updateBeforeResponse === true && !isNil(data[def.name as keyof R])) {
      obj[def.name] = data[def.name as keyof R];
    }
  });
  return obj;
};

export const requestWarrantsParentRefresh = <P>(data: Partial<P>, type: Table.RowType): boolean => {
  let parentRefreshRequired = false;
  const fieldDefs = FieldDefinitions[type] as IFieldDefinition[];
  const fieldsTriggeringRefresh = map(
    filter(fieldDefs, (def: IFieldDefinition) => def.triggerParentRefresh === true),
    (def: IFieldDefinition) => def.name
  );
  forEach(fieldsTriggeringRefresh, (field: string) => {
    if (!isNil(data[field as keyof Partial<P>])) {
      parentRefreshRequired = true;
      return false;
    }
  });
  return parentRefreshRequired;
};

export const rowHasRequiredFields = <R extends { [key: string]: any }>(row: R, type: Table.RowType): boolean => {
  let requiredFieldsPresent = true;
  const fieldDefs = FieldDefinitions[type] as IFieldDefinition[];
  forEach(fieldDefs, (def: IFieldDefinition) => {
    if (def.requiredForPost === true) {
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
