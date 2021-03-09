import { isNil, forEach } from "lodash";

const ACTUAL_PAYLOAD_FIELDS: Table.ActualRowField[] = [
  "description",
  "parent",
  "vendor",
  "purchase_order",
  "date",
  "payment_method",
  "payment_id",
  "value"
];
const ACTUAL_REQUIRED_PAYLOAD_FIELDS: Table.ActualRowField[] = ["parent"];
const SUBACCOUNT_PAYLOAD_FIELDS: Table.SubAccountRowField[] = [
  "description",
  "name",
  "quantity",
  "rate",
  "multiplier",
  "unit",
  "line"
];
const SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS: Table.SubAccountRowField[] = ["line", "name"];
const ACCOUNT_PAYLOAD_FIELDS: Table.AccountRowField[] = ["description", "account_number"];
const ACCOUNT_REQUIRED_PAYLOAD_FIELDS: Table.AccountRowField[] = ["account_number"];

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const subAccountPayloadFromRow = (
  row: Table.ISubAccountRow
): Http.ISubAccountPayload | Partial<Http.ISubAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(SUBACCOUNT_PAYLOAD_FIELDS, (field: Table.SubAccountRowField) => {
    const cell = row[field];
    if (!isNil(cell)) {
      obj[field] = cell;
    }
  });
  return obj;
};

export const accountPayloadFromRow = (row: Table.IAccountRow): Http.IAccountPayload | Partial<Http.IAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACCOUNT_PAYLOAD_FIELDS, (field: Table.AccountRowField) => {
    const cell = row[field];
    if (!isNil(cell)) {
      obj[field] = cell;
    }
  });
  return obj;
};

export const actualPayloadFromRow = (row: Table.IActualRow): Http.IActualPayload | Partial<Http.IActualPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACTUAL_PAYLOAD_FIELDS, (field: Table.ActualRowField) => {
    const cell = row[field];
    if (!isNil(cell)) {
      obj[field] = cell;
    }
  });
  return obj;
};

const rowHasRequiredFieldsFn = <F extends string>(fields: F[]) => (row: any): boolean => {
  let requiredFieldsPresent = true;
  forEach(fields, (field: F) => {
    const cell = row[field];
    if (isNil(cell) || cell === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

export const subAccountRowHasRequiredfields = rowHasRequiredFieldsFn(SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS);
export const accountRowHasRequiredfields = rowHasRequiredFieldsFn(ACCOUNT_REQUIRED_PAYLOAD_FIELDS);
export const actualRowHasRequiredfields = rowHasRequiredFieldsFn(ACTUAL_REQUIRED_PAYLOAD_FIELDS);

const convertResponseToCellUpdatesFn = <F extends string>(fields: F[]) => (response: any): Table.ICellUpdate<F>[] => {
  const updates: Table.ICellUpdate<F>[] = [];
  forEach(fields, (field: F) => {
    updates.push({
      row: response.id,
      column: field,
      value: response[field]
    });
  });
  return updates;
};

export const convertAccountResponseToCellUpdates = convertResponseToCellUpdatesFn(ACCOUNT_PAYLOAD_FIELDS);
export const convertSubAccountResponseToCellUpdates = convertResponseToCellUpdatesFn(SUBACCOUNT_PAYLOAD_FIELDS);
export const convertActualResponseToCellUpdates = convertResponseToCellUpdatesFn(ACTUAL_PAYLOAD_FIELDS);

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
