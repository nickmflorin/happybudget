import Cookies from "universal-cookie";

import * as config from "config";

import { parsers } from "./util";

export const setConfirmationSuppressed = (key: string, value: boolean) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(key, value);
};

export const confirmationIsSuppressed = (key: string) => {
  const cookiesObj = new Cookies();
  const value = cookiesObj.get(key);
  const booleanValue = parsers.parseBoolean(value);
  // The value will be undefined if a boolean value cannot be inferred.
  if (booleanValue !== null) {
    return booleanValue;
  }
  return false;
};
