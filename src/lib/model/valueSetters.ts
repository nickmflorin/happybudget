import { isNil } from "lodash";
import { ValueSetterParams } from "@ag-grid-community/core";
import { toApiDateTime } from "lib/util/dates";

/* prettier-ignore */
export const percentageToDecimalValueSetter =
  <R extends Table.Row>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === "" || !isNaN(parseFloat(params.newValue))) {
        params.data[field] = parseFloat(params.newValue) / 100;
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const floatValueSetter =
  <R extends Table.Row>(field: keyof R, nullable = true) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined && nullable) {
        params.data[field] = null;
      } else if (!isNaN(parseFloat(params.newValue))) {
        params.data[field] = parseFloat(params.newValue);
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const integerValueSetter =
  <R extends Table.Row>(field: keyof R, nullable = true) =>
    (params: ValueSetterParams): boolean => {
      if (params.newValue === undefined && nullable) {
        params.data[field] = null;
      } else if (!isNaN(parseInt(params.newValue))) {
        params.data[field] = parseInt(params.newValue);
        return true;
      }
      return false;
    };

/* prettier-ignore */
export const dateTimeValueSetter =
  <R extends Table.Row>(field: keyof R) =>
    (params: ValueSetterParams): boolean => {
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
