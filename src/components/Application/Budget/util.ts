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
    if (!isNil(row[field]) && !isNil(row[field].value)) {
      obj[field] = row[field].value;
    }
  });
  return obj;
};

export const accountPayloadFromRow = (
  row: Redux.Budget.IAccountRow | Partial<Redux.Budget.IAccountRow>
): Http.IAccountPayload | Partial<Http.IAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(ACCOUNT_PAYLOAD_FIELDS, (field: keyof Redux.Budget.IAccountRow) => {
    if (!isNil(row[field]) && !isNil(row[field].value)) {
      obj[field] = row[field].value;
    }
  });
  return obj;
};

export const subAccountRowHasRequiredfields = (row: Redux.Budget.ISubAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(SUBACCOUNT_REQUIRED_PAYLOAD_FIELDS, (field: keyof Redux.Budget.ISubAccountRow) => {
    const val = row[field].value;
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
    const val = row[field].value;
    if (isNil(val) || val === "") {
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

const getDefaultValue = (
  field: "selected" | "isPlaceholder",
  existing: Redux.Budget.ISubAccountRow | Redux.Budget.IAccountRow | undefined,
  overrides: IOverrides | undefined,
  def: boolean = false
): boolean => {
  if (!isNil(overrides) && !isNil(overrides[field])) {
    return overrides[field] as boolean;
  } else if (!isNil(existing) && !isNil(existing[field])) {
    return existing[field];
  } else {
    return def;
  }
};

export const convertAccountToRow = (
  account: IAccount,
  existing?: Redux.Budget.IAccountRow,
  overrides?: IOverrides
): Redux.Budget.IAccountRow => ({
  account_number: {
    value: account.account_number,
    error: !isNil(existing) ? existing.account_number.error : undefined
  },
  description: { value: account.description, error: !isNil(existing) ? existing.description.error : undefined },
  id: account.id,
  isPlaceholder: getDefaultValue("isPlaceholder", existing, overrides),
  selected: getDefaultValue("selected", existing, overrides),
  estimated: { value: account.estimated, error: !isNil(existing) ? existing.estimated.error : undefined },
  variance: { value: account.variance, error: !isNil(existing) ? existing.variance.error : undefined },
  subaccounts: account.subaccounts
});

export const convertSubAccountToRow = (
  subaccount: ISubAccount,
  existing?: Redux.Budget.ISubAccountRow,
  overrides?: IOverrides
): Redux.Budget.ISubAccountRow => ({
  name: { value: subaccount.name, error: !isNil(existing) ? existing.name.error : undefined },
  line: { value: subaccount.line, error: !isNil(existing) ? existing.line.error : undefined },
  unit: { value: subaccount.unit, error: !isNil(existing) ? existing.unit.error : undefined },
  multiplier: { value: subaccount.multiplier, error: !isNil(existing) ? existing.multiplier.error : undefined },
  rate: { value: subaccount.rate, error: !isNil(existing) ? existing.rate.error : undefined },
  quantity: { value: subaccount.quantity, error: !isNil(existing) ? existing.quantity.error : undefined },
  description: { value: subaccount.description, error: !isNil(existing) ? existing.description.error : undefined },
  id: subaccount.id,
  isPlaceholder: getDefaultValue("isPlaceholder", existing, overrides),
  selected: getDefaultValue("selected", existing, overrides),
  estimated: { value: subaccount.estimated, error: !isNil(existing) ? existing.estimated.error : undefined },
  variance: { value: subaccount.variance, error: !isNil(existing) ? existing.variance.error : undefined },
  subaccounts: subaccount.subaccounts
});

export const createSubAccountRowPlaceholder = (): Redux.Budget.ISubAccountRow => ({
  name: { value: null },
  line: { value: null },
  unit: { value: null },
  multiplier: { value: null },
  rate: { value: null },
  quantity: { value: null },
  description: { value: null },
  id: uuidv4(),
  isPlaceholder: true,
  selected: false,
  estimated: { value: null },
  variance: { value: null },
  subaccounts: []
});

export const createAccountRowPlaceholder = (): Redux.Budget.IAccountRow => ({
  account_number: { value: null },
  description: { value: null },
  id: uuidv4(),
  isPlaceholder: true,
  selected: false,
  estimated: { value: null },
  variance: { value: null },
  subaccounts: []
});
