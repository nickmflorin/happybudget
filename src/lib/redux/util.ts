import { isNil, find } from "lodash";
import { toTitleCase } from "lib/util/formatters";

interface WarningParams {
  readonly level?: "error" | "warn";
  readonly action?: Redux.Action<any> | string;
  readonly payload?: any;
  [key: string]: any;
}

type Formatter<V> = { key: string; formatter: (v: V, params: WarningParams) => string | undefined };

/* eslint-disable indent */
const Formatters = [
  { key: "action", formatter: (value: Redux.Action<any> | string) => (typeof value === "string" ? value : value.type) },
  {
    key: "payload",
    formatter: (value: any, params: WarningParams) =>
      !isNil(value)
        ? JSON.stringify(value)
        : !isNil(params.action) && typeof params.action !== "string"
        ? JSON.stringify(params.action.payload)
        : undefined
  }
];

const addParam = (message: string, params: WarningParams, paramName: string) => {
  const formatter: Formatter<any> | undefined = find(Formatters, { key: paramName });
  let value = params[paramName];
  if (value !== undefined) {
    if (!isNil(formatter)) {
      value = formatter.formatter(value, params);
    }
    return message + `\n\t${toTitleCase(paramName)}: ${value}`;
  }
  return message;
};

export const warnInconsistentState = ({ level = "warn", ...props }: WarningParams): void => {
  const method = console[level || "warn"];
  let message = "Inconsistent State!";
  Object.keys(props).forEach((key: string) => {
    message = addParam(message, props, key);
  });
  method(message);
};
