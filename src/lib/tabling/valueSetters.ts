import { isNil, find } from "lodash";
import { ValueSetterParams } from "ag-grid-community";
import { findChoiceForName } from "lib/model/util";
import { toApiDateTime } from "lib/util/dates";

export const percentageToDecimalValueSetter = <R extends Table.Row>(field: keyof R) => (
  params: ValueSetterParams
): boolean => {
  if (!isNaN(parseFloat(params.newValue))) {
    params.data[field] = parseFloat(params.newValue) / 100;
    return true;
  }
  return false;
};

export const floatValueSetter = <R extends Table.Row>(field: keyof R) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseFloat(params.newValue))) {
    params.data[field] = parseFloat(params.newValue);
    return true;
  }
  return false;
};

export const integerValueSetter = <R extends Table.Row>(field: keyof R) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseInt(params.newValue))) {
    params.data[field] = parseInt(params.newValue);
    return true;
  }
  return false;
};

export const dateTimeValueSetter = <R extends Table.Row>(field: keyof R) => (params: ValueSetterParams): boolean => {
  if (params.newValue === undefined || params.newValue === null) {
    params.data[field] = null;
    return true;
  }
  const dateTime = toApiDateTime(params.newValue);
  if (!isNil(dateTime)) {
    params.data[field] = dateTime;
    return true;
  }
  return false;
};

interface choiceModelValueSetterOptions {
  allowNull?: boolean;
}

export const choiceModelValueSetter = <R extends Table.Row, M extends Model.Choice<number, string>>(
  field: keyof R,
  models: M[],
  options?: choiceModelValueSetterOptions
) => (params: ValueSetterParams): boolean => {
  /* eslint-disable indent */
  if (typeof params.newValue === "string") {
    const optionModel = findChoiceForName(models, params.newValue, false);
    if (!isNil(optionModel)) {
      params.data[field] = optionModel.name;
      return true;
    }
    return false;
  } else if (params.newValue === undefined || params.newValue === null) {
    if (!isNil(options) && options.allowNull === true) {
      params.data[field] = null;
      return true;
    }
    return false;
  } else {
    // For now - we allow setting the model by the ID - but we will most likely not be needing
    // this in the future since we are relying more on using string names for the row values.
    const optionModel = find(models, { id: params.newValue });
    if (!isNil(optionModel)) {
      params.data[field] = optionModel.name;
      return true;
    }
    return false;
  }
};
