import { ValueSetterParams } from "ag-grid-community";

export const percentageToDecimalValueSetter = (field: string) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseFloat(params.newValue))) {
    params.data[field] = parseFloat(params.newValue) / 100;
    return true;
  }
  return false;
};

export const floatValueSetter = (field: string) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseFloat(params.newValue))) {
    params.data[field] = parseFloat(params.newValue);
    return true;
  }
  return false;
};

export const integerValueSetter = (field: string) => (params: ValueSetterParams): boolean => {
  if (!isNaN(parseInt(params.newValue))) {
    params.data[field] = parseInt(params.newValue);
    return true;
  }
  return false;
};
