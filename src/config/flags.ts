import { includes, isNil } from "lodash";

const TRUTHY_VALUES = ["1", "true", "on"];

export const stringIsTruthy = (value: string | undefined | null): boolean | undefined =>
  !isNil(value) ? includes(TRUTHY_VALUES, value.toLowerCase()) : undefined;

export const evaluateEnvFlag = (envVarName: string): boolean | undefined => {
  const valueFromEnv: string | undefined = process.env[envVarName];
  return stringIsTruthy(valueFromEnv);
};

export const evaluateMemoryFlag = (envVarName: string): boolean | undefined => {
  const valueFromMemory: string | null = localStorage.getItem(envVarName);
  return stringIsTruthy(valueFromMemory);
};

export const evaluateFlagFromEnvOrMemory = (option: Application.ConfigOption): boolean => {
  if (option.devOnly === true && process.env.NODE_ENV !== "development") {
    return false;
  }
  const valueFromEnv = evaluateEnvFlag(option.name);
  if (valueFromEnv !== undefined) {
    return valueFromEnv;
  }
  const valueFromMemory = evaluateMemoryFlag(option.name);
  if (!isNil(valueFromMemory)) {
    return valueFromMemory;
  }
  return option.default === undefined ? false : option.default;
};
