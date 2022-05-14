import { includes } from "lodash";
import { ConfigMessage, ConfigValue, ConfigMessageCallbackParams } from "./config";

/**
 * Parsers are responsible for parsing a *defined* string value from either
 * the ENV file or local storage and returning the appropriate native value.
 */
export type FailedConfigParserResult = {
  readonly value: string;
  readonly message?: ConfigMessage<string>;
};
export type ConfigParserResult<V extends ConfigValue> = V | FailedConfigParserResult | undefined;
export type Parser<V extends ConfigValue> = (v: string) => ConfigParserResult<V>;

type ConfigParserOptions = {
  readonly message?: ConfigMessage<string>;
  readonly strict?: boolean;
};

export const isParserFailedResult = <V extends ConfigValue>(
  result: ConfigParserResult<V>
): result is FailedConfigParserResult => typeof result === "object";

const TRUTHY_VALUES = ["1", "true", "on"];
const FALSEY_VALUES = ["0", "false", "off"];

export const booleanParser =
  (opts?: ConfigParserOptions) =>
  (v: string): ConfigParserResult<boolean> => {
    if (includes(TRUTHY_VALUES, v)) {
      return true;
    } else if (includes(FALSEY_VALUES, v)) {
      return false;
    } else if (opts?.strict === false) {
      return undefined;
    } else {
      return {
        message:
          opts?.message ||
          (({ name }: ConfigMessageCallbackParams<string>) =>
            `Config ${name} value ${v} could not be converted to a boolean.`),
        value: v
      };
    }
  };
