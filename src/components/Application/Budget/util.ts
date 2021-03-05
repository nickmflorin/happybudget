import { isNil, forEach } from "lodash";
import { v4 as uuidv4 } from "uuid";

const PAYLOAD_FIELDS: (keyof Redux.Budget.ISubAccountRow)[] = [
  "description",
  "name",
  "quantity",
  "rate",
  "multiplier",
  "unit",
  "line"
];
const REQUIRED_PAYLOAD_FIELDS: (keyof Redux.Budget.ISubAccountRow)[] = ["line", "name"];

export const subAccountPayloadFromRow = (
  row: Redux.Budget.ISubAccountRow | Partial<Redux.Budget.ISubAccountRow>
): Http.ISubAccountPayload | Partial<Http.ISubAccountPayload> => {
  const obj: { [key: string]: any } = {};
  forEach(PAYLOAD_FIELDS, (field: keyof Redux.Budget.ISubAccountRow) => {
    if (!isNil(row[field])) {
      obj[field] = row[field];
    }
  });
  return obj;
};

export const subAccountRowHasRequiredfields = (row: Redux.Budget.ISubAccountRow): boolean => {
  let requiredFieldsPresent = true;
  forEach(REQUIRED_PAYLOAD_FIELDS, (field: keyof Redux.Budget.ISubAccountRow) => {
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
