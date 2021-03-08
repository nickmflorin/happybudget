import { isNil, forEach } from "lodash";

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

export const subAccountRowHasRequiredfields = (row: Redux.Budget.ISubAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS, (field: Redux.Budget.SubAccountRowField) => {
    const cell = row[field] as ICell;
    if (isNil(cell.value) || cell.value === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

export const accountRowHasRequiredfields = (row: Redux.Budget.IAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(ACCOUNT_REQUIRED_PAYLOAD_FIELDS, (field: Redux.Budget.AccountRowField) => {
    const cell = row[field] as ICell;
    if (isNil(cell.value) || cell.value === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

interface IOverrides {
  selected?: boolean;
  isPlaceholder?: boolean;
}

const getDefaultMetaValue = (
  field: "selected" | "isPlaceholder",
  existing: Redux.Budget.ISubAccountRow | Redux.Budget.IAccountRow | undefined,
  overrides: IOverrides | undefined,
  def: boolean = false
): boolean => {
  if (!isNil(overrides) && !isNil(overrides[field])) {
    return overrides[field] as boolean;
  } else if (!isNil(existing) && !isNil(existing.meta[field])) {
    return existing.meta[field];
  } else {
    return def;
  }
};

export const convertAccountResponseToCellUpdates = (
  response: IAccount
): ICellUpdate<Redux.Budget.AccountRowField>[] => {
  const updates: ICellUpdate<Redux.Budget.AccountRowField>[] = [];
  forEach(ACCOUNT_PAYLOAD_FIELDS, (field: Redux.Budget.AccountRowField) => {
    updates.push({
      row: response.id,
      column: field,
      value: response[field]
    });
  });
  return updates;
};

export const convertSubAccountResponseToCellUpdates = (
  response: ISubAccount
): ICellUpdate<Redux.Budget.SubAccountRowField>[] => {
  const updates: ICellUpdate<Redux.Budget.SubAccountRowField>[] = [];
  forEach(SUBACCOUNT_PAYLOAD_FIELDS, (field: Redux.Budget.SubAccountRowField) => {
    updates.push({
      row: response.id,
      column: field,
      value: response[field]
    });
  });
  return updates;
};

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
