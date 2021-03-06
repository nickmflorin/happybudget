import { isNil, forEach } from "lodash";
import { v4 as uuidv4 } from "uuid";

const SUBACCOUNT_PAYLOAD_FIELDS: (keyof Redux.Budget.ISubAccountRow)[] = [
  "description",
  "name",
  "quantity",
  "rate",
  "multiplier",
  "unit",
  "line"
];
const SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS: (keyof Redux.Budget.ISubAccountRow)[] = ["line", "name"];
const ACCOUNT_PAYLOAD_FIELDS: (keyof Redux.Budget.IAccountRow)[] = ["description", "account_number"];
const ACCOUNT_REQUIRED_PAYLOAD_FIELDS: (keyof Redux.Budget.IAccountRow)[] = ["account_number"];

export const subAccountPayloadFromRow = (
  row: Redux.Budget.ISubAccountRow | Partial<Redux.Budget.ISubAccountRow>
): Http.ISubAccountPayload | Partial<Http.ISubAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(SUBACCOUNT_PAYLOAD_FIELDS, (field: keyof Redux.Budget.ISubAccountRow) => {
    if (!isNil(row[field])) {
      obj[field] = row[field];
    }
  });
  return obj;
};

export const accountPayloadFromRow = (
  row: Redux.Budget.IAccountRow | Partial<Redux.Budget.IAccountRow>
): Http.IAccountPayload | Partial<Http.IAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACCOUNT_PAYLOAD_FIELDS, (field: keyof Redux.Budget.IAccountRow) => {
    if (!isNil(row[field])) {
      obj[field] = row[field];
    }
  });
  return obj;
};

export const subAccountRowHasRequiredfields = (row: Redux.Budget.ISubAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS, (field: keyof Redux.Budget.ISubAccountRow) => {
    const val = row[field];
    if (isNil(val) || val === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

export const accountRowHasRequiredfields = (row: Redux.Budget.IAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(ACCOUNT_REQUIRED_PAYLOAD_FIELDS, (field: keyof Redux.Budget.IAccountRow) => {
    const val = row[field];
    if (isNil(val) || val === "") {
      requiredFieldsPresent = false;
      return false;
    }
  });
  return requiredFieldsPresent;
};

export const createSubAccountRowPlaceholder = (): Redux.Budget.ISubAccountRow => ({
  name: null,
  line: null,
  unit: null,
  multiplier: null,
  rate: null,
  quantity: null,
  description: null,
  id: uuidv4(),
  isPlaceholder: true,
  selected: false
});

export const createAccountRowPlaceholder = (): Redux.Budget.IAccountRow => ({
  account_number: null,
  description: null,
  id: uuidv4(),
  isPlaceholder: true,
  selected: false
});
