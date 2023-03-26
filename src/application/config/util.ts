import { parsers } from "lib";

type EnvVarTypeName = "string" | "number" | "boolean";

type SafeEnvVarOptions = {
  readonly required?: true;
  readonly type?: EnvVarTypeName;
};

type SafeEnvVarType<O> = O extends { readonly type: infer T extends EnvVarTypeName }
  ? {
      boolean: boolean;
      string: string;
      number: number;
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
    case "number":
      const parsedInt = parsers.parseInteger(nullableValue);
      if (parsedInt === null && required) {
        throw new TypeError(`Value for environment variable '${name}' is not a valid integer!"`);
      }
      return parsedInt as SafeEnvVarRT<O>;
    case "boolean":
      const parsedBool = parsers.parseBoolean(nullableValue);
      if (parsedBool === null && required) {
        throw new TypeError(`Value for environment variable '${name}' is not a valid boolean!"`);
      }
      return parsedBool as SafeEnvVarRT<O>;
    default:
      return nullableValue as SafeEnvVarRT<O>;
  }
};
