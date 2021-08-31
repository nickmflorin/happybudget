import { toTitleCase } from "lib/util/formatters";

interface WarningParams {
  level?: "error" | "warn";
  [key: string]: any;
}

export const warnInconsistentState = ({ level = "warn", ...props }: WarningParams): void => {
  /* eslint-disable no-console */
  const method = console[level || "warn"];

  let message = "Inconsistent State!";
  Object.keys(props).forEach((key: string) => {
    message = message + `\n\t${toTitleCase(key)}: ${props[key]}`;
  });
  method(message);
};
