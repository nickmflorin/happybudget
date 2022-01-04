import { includes, isNil, reduce } from "lodash";
import Cookies from "universal-cookie";
import * as flags from "config/flags";

export const parseHiddenColumns = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  obj: any,
  validateAgainst?: string[]
): Table.HiddenColumns => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let data: any = null;
  if (typeof obj === "string") {
    try {
      data = JSON.parse(obj);
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e;
      }
      return {};
    }
  } else if (typeof obj === "object") {
    data = obj;
  }
  if (!isNil(data)) {
    const cols = Object.keys(data);
    return reduce(
      cols,
      (curr: { [key: string]: boolean }, c: string) => {
        if (isNil(validateAgainst) || includes(validateAgainst, c)) {
          if (typeof data[c] === "boolean") {
            return { ...curr, [c]: data[c] };
          }
        }
        return { ...curr };
      },
      {}
    );
  }
  return {};
};

export const getHiddenColumns = (cookieName: string, validateAgainst?: string[]): Table.HiddenColumns => {
  const cookiesObj = new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(cookieName);
  return parseHiddenColumns(cookiesHiddenColumns, validateAgainst);
};

export const setHiddenColumns = (cookieName: string, fields: Table.HiddenColumns) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(cookieName, fields);
};

export const setDeleteModalConfirmationSuppression = (value: boolean) => {
  const cookiesObj = new Cookies();
  cookiesObj.set("delete-modal-confirmation-visibility", value);
};

export const deleteModalConfirmationIsSuppressed = () => {
  const cookiesObj = new Cookies();
  const value = cookiesObj.get("delete-modal-confirmation-visibility");
  const valueIsTruthy = flags.stringIsTruthy(value);
  if (typeof valueIsTruthy !== "undefined") {
    return valueIsTruthy;
  }
  return false;
};
