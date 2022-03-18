import Cookies from "universal-cookie";
import * as flags from "config/flags";

export const setConfirmationSuppressed = (key: string, value: boolean) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(key, value);
};

export const confirmationIsSuppressed = (key: string) => {
  const cookiesObj = new Cookies();
  const value = cookiesObj.get(key);
  const valueIsTruthy = flags.stringIsTruthy(value);
  // The value will be undefined if a boolean value cannot be inferred.
  if (valueIsTruthy !== undefined) {
    return valueIsTruthy;
  }
  return false;
};
