import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import * as util from "../util";

const numericValueConverter = (value: any): number | null | false => {
  if (value === null || value === undefined) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    let stringValue: string = value.replace(/[^0-9.-]+/g, "");
    if (stringValue.trim() === "") {
      return false;
    }
    return numericValueConverter(stringValue);
  }
  return false;
};

/* prettier-ignore */
export const numericValueSetter =
  <R extends Table.RowData>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
      const result = numericValueConverter(params.newValue);
      if (result === false) {
        return false;
      }
      params.data.data[field] = result;
      return true;
    };

/* prettier-ignore */
export const percentageToDecimalValueSetter =
  <R extends Table.RowData>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === "" || !isNaN(parseFloat(params.newValue))) {
        params.data.data[field] = parseFloat(params.newValue) / 100;
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const dateTimeValueSetter =
  <R extends Table.RowData>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined || params.newValue === null) {
        params.data.data[field] = null;
        return true;
      }
      const dateTime = util.dates.toApiDateTime(params.newValue);
      if (!isNil(dateTime)) {
        params.data.data[field] = dateTime;
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const emailValueSetter =
<R extends Table.RowData>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined || params.newValue === null) {
        params.data.data[field] = null;
        return true;
      }
      if (!util.validate.validateEmail(params.newValue)) {
        return false;
      }
      params.data.data[field] = params.newValue;
      return true;
    };
