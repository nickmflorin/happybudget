import { isNil, forEach } from "lodash";

const ACTUAL_PAYLOAD_FIELDS: Redux.Budget.ActualRowField[] = [
  "description",
  "parent",
  "vendor",
  "purchase_order",
  "date",
  "payment_method",
  "payment_id",
  "value"
];
const ACTUAL_REQUIRED_PAYLOAD_FIELDS: Redux.Budget.ActualRowField[] = ["parent"];
const SUBACCOUNT_PAYLOAD_FIELDS: Redux.Budget.SubAccountRowField[] = [
  "description",
  "name",
  "quantity",
  "rate",
  "multiplier",
  "unit",
  "line"
];
const SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS: Redux.Budget.SubAccountRowField[] = ["line", "name"];
const ACCOUNT_PAYLOAD_FIELDS: Redux.Budget.AccountRowField[] = ["description", "account_number"];
const ACCOUNT_REQUIRED_PAYLOAD_FIELDS: Redux.Budget.AccountRowField[] = ["account_number"];

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const subAccountPayloadFromRow = (
  row: Redux.Budget.ISubAccountRow
): Http.ISubAccountPayload | Partial<Http.ISubAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(SUBACCOUNT_PAYLOAD_FIELDS, (field: Redux.Budget.SubAccountRowField) => {
    const cell = row[field] as ICell | undefined;
    if (!isNil(cell) && !isNil(cell.value)) {
      obj[field] = cell.value;
    }
  });
  return obj;
};

export const accountPayloadFromRow = (
  row: Redux.Budget.IAccountRow
): Http.IAccountPayload | Partial<Http.IAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACCOUNT_PAYLOAD_FIELDS, (field: Redux.Budget.AccountRowField) => {
    const cell = row[field] as ICell | undefined;
    if (!isNil(cell) && !isNil(cell.value)) {
      obj[field] = cell.value;
    }
  });
  return obj;
};

export const actualPayloadFromRow = (
  row: Redux.Budget.IActualRow
): Http.IActualPayload | Partial<Http.IActualPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACTUAL_PAYLOAD_FIELDS, (field: Redux.Budget.ActualRowField) => {
    const cell = row[field] as ICell | undefined;
    if (!isNil(cell) && !isNil(cell.value)) {
      obj[field] = cell.value;
    }
  });
  return obj;
};

const rowHasRequiredFieldsFn = <F extends string>(fields: F[]) => (row: any): boolean => {
  let requiredFieldsPresent = true;
  forEach(fields, (field: F) => {
    const cell = row[field] as ICell;
    if (isNil(cell.value) || cell.value === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

export const subAccountRowHasRequiredfields = rowHasRequiredFieldsFn(SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS);
export const accountRowHasRequiredfields = rowHasRequiredFieldsFn(ACCOUNT_REQUIRED_PAYLOAD_FIELDS);
export const actualRowHasRequiredfields = rowHasRequiredFieldsFn(ACTUAL_REQUIRED_PAYLOAD_FIELDS);

const convertResponseToCellUpdatesFn = <F extends string>(fields: F[]) => (response: any): ICellUpdate<F>[] => {
  const updates: ICellUpdate<F>[] = [];
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

export const initializeRowFromAccount = (account: IAccount): Redux.Budget.IAccountRow => ({
  id: account.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: account.subaccounts
  },
  account_number: {
    value: account.account_number
  },
  description: { value: account.description },
  estimated: { value: account.estimated },
  variance: { value: account.variance }
});

export const initializeRowFromActual = (actual: IActual): Redux.Budget.IActualRow => ({
  id: actual.id,
  meta: {
    isPlaceholder: false,
    selected: false
  },
  description: { value: actual.description },
  vendor: { value: actual.vendor },
  purchase_order: { value: actual.purchase_order },
  date: { value: actual.date },
  payment_id: { value: actual.payment_id },
  value: { value: actual.value },
  payment_method: { value: actual.payment_method },
  parent: { value: actual.parent }
});

export const initializeRowFromSubAccount = (subaccount: ISubAccount): Redux.Budget.ISubAccountRow => ({
  id: subaccount.id,
  meta: {
    isPlaceholder: false,
    selected: false,
    subaccounts: subaccount.subaccounts
  },
  name: { value: subaccount.name },
  line: { value: subaccount.line },
  unit: { value: subaccount.unit },
  multiplier: { value: subaccount.multiplier },
  rate: { value: subaccount.rate },
  quantity: { value: subaccount.quantity },
  description: { value: subaccount.description },
  estimated: { value: subaccount.estimated },
  variance: { value: subaccount.variance }
});

export const createActualRowPlaceholder = (): Redux.Budget.IActualRow => ({
  id: generateRandomNumericId(),
  meta: {
    isPlaceholder: true,
    selected: false
  },
  description: { value: null },
  vendor: { value: null },
  purchase_order: { value: null },
  date: { value: null },
  payment_id: { value: null },
  value: { value: null },
  payment_method: { value: null },
  parent: { value: null }
});

export const createSubAccountRowPlaceholder = (): Redux.Budget.ISubAccountRow => ({
  id: generateRandomNumericId(),
  name: { value: null },
  line: { value: null },
  unit: { value: null },
  multiplier: { value: null },
  rate: { value: null },
  quantity: { value: null },
  description: { value: null },
  estimated: { value: null },
  variance: { value: null },
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: []
  }
});

export const createAccountRowPlaceholder = (): Redux.Budget.IAccountRow => ({
  id: generateRandomNumericId(),
  account_number: { value: null },
  description: { value: null },
  estimated: { value: null },
  variance: { value: null },
  meta: {
    isPlaceholder: true,
    selected: false,
    subaccounts: []
  }
});
