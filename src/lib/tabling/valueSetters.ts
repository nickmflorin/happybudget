import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";

import * as util from "../util";

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
export const floatValueSetter =
  <R extends Table.RowData>(field: keyof R, nullable = true) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined && nullable) {
        params.data.data[field] = null;
        return true;
      } else if (params.newValue === null && nullable) {
        params.data.data[field] = null;
        return true;
      } else if (!isNaN(parseFloat(params.newValue))) {
        params.data.data[field] = parseFloat(params.newValue);
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const integerValueSetter =
  <R extends Table.RowData>(field: keyof R, nullable = true) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined && nullable) {
        params.data.data[field] = null;
        return true;
      } else if (params.newValue === null && nullable) {
        params.data.data[field] = null;
        return true;
      } else if (!isNaN(parseInt(params.newValue))) {
        params.data.data[field] = parseInt(params.newValue);
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
