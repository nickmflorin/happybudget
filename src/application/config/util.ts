import { parseInteger, parseBoolean, parseNumber } from "lib/util/parsers";

type EnvVarTypeName = "string" | "integer" | "boolean" | "number";

type SafeEnvVarOptions = {
  readonly required?: true;
  readonly type?: EnvVarTypeName;
};

type SafeEnvVarType<O> = O extends { readonly type: infer T extends EnvVarTypeName }
  ? {
      boolean: boolean;
      string: string;
      number: number;
      integer: number;
    }[T]
  : string;

type SafeEnvVarRT<O extends SafeEnvVarOptions | undefined> = O extends { readonly required: true }
  ? SafeEnvVarType<O>
  : SafeEnvVarType<O> | null | undefined;

export const parseEnvVar = <O extends SafeEnvVarOptions>(
  value: string | undefined,
  name: string,
  options?: O,
): SafeEnvVarRT<O> => {
  const required = options?.required === undefined ? false : options.required;

  let nullableValue: string | null | undefined = value;
  if (value !== undefined && value.toLowerCase() === "none") {
    nullableValue = null;
  }

  if (nullableValue === null || nullableValue === undefined) {
    if (required) {
      throw new TypeError(
        `Value for environment variable '${name}' was not found in the environment!"`,
      );
    }
    return nullableValue as SafeEnvVarRT<O>;
  }

  switch (options?.type) {
    case "string":
      return nullableValue as SafeEnvVarRT<O>;
    case "integer":
      const parsedNum = parseNumber(nullableValue);
      if (parsedNum === null && required) {
        throw new TypeError(`Value for environment variable '${name}' is not a valid number!"`);
      }
      return parsedNum as SafeEnvVarRT<O>;
    case "number":
      const parsedInt = parseInteger(nullableValue);
      if (parsedInt === null && required) {
        throw new TypeError(`Value for environment variable '${name}' is not a valid integer!"`);
      }
      return parsedInt as SafeEnvVarRT<O>;
    case "boolean":
      const parsedBool = parseBoolean(nullableValue);
      if (parsedBool === null && required) {
        throw new TypeError(`Value for environment variable '${name}' is not a valid boolean!"`);
      }
      return parsedBool as SafeEnvVarRT<O>;
    default:
      return nullableValue as SafeEnvVarRT<O>;
  }
};

export type NextLoc = "server" | "client";

export const getNextLoc = (): NextLoc => (typeof window === "undefined" ? "server" : "client");
