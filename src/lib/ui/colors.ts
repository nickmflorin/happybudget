import * as types from "./types";

export const contrastedForegroundColor = (backgroundColor: types.HexColor): types.HexColor => {
  const r = parseInt(backgroundColor.substring(1, 3), 16) * 0.299;
  const g = parseInt(backgroundColor.substring(3, 5), 16) * 0.587;
  const b = parseInt(backgroundColor.substring(5, 7), 16) * 0.114;
  return r + g + b < 200 ? "#FFFFFF" : "#3f4252";
};

export const getLoopedColorInScheme = (scheme: types.HexColor[], index: number) =>
  scheme[index] !== undefined ? scheme[index] : scheme[scheme.length % index];
