import Cookies from "universal-cookie";

import * as columns from "./columns";

export const parseHiddenColumns = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  obj: any,
  validateAgainst?: string[],
): columns.HiddenColumns => {
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
  if (data !== null) {
    const cols = Object.keys(data);
    return cols.reduce((curr: { [key: string]: boolean }, c: string) => {
      if (validateAgainst === undefined || validateAgainst.includes(c)) {
        if (typeof data[c] === "boolean") {
          return { ...curr, [c]: data[c] };
        }
      }
      return { ...curr };
    }, {});
  }
  return {};
};

export const getHiddenColumns = (
  tableId: string,
  validateAgainst?: string[],
): columns.HiddenColumns => {
  const cookiesObj = new Cookies();
  const cookiesHiddenColumns = cookiesObj.get(`hidden-columns-${tableId}`);
  return parseHiddenColumns(cookiesHiddenColumns, validateAgainst);
};

export const setHiddenColumns = (tableId: string, fields: columns.HiddenColumns) => {
  const cookiesObj = new Cookies();
  cookiesObj.set(`hidden-columns-${tableId}`, fields);
};
