import { filter, find, isNil, reduce } from "lodash";

export const sumChars = (val: string): number => {
  let sum = 0;
  for (let i = 0; i < val.length; i++) {
    sum += val.charCodeAt(i);
  }
  return sum;
};

export const hashString = (s: string): number =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

type JoinStringArg = number | string | null | undefined;
type JoinStringConfig = {
  readonly delimeter?: string;
  readonly replaceMissing?: string | boolean;
  readonly ifBlank?: string;
};

export function conditionalJoinString(arg0: JoinStringArg, config?: JoinStringConfig): string;
export function conditionalJoinString(arg0: JoinStringArg, arg1: JoinStringArg, config?: JoinStringConfig): string;
export function conditionalJoinString(
  arg0: JoinStringArg,
  arg1: JoinStringArg,
  arg2: JoinStringArg,
  config?: JoinStringConfig
): string;

export function conditionalJoinString(...args: (JoinStringArg | JoinStringConfig)[]): string {
  const isArg = (a: JoinStringArg | JoinStringConfig): a is JoinStringArg => typeof a === "string";
  const isConfig = (a: JoinStringArg | JoinStringConfig): a is JoinStringConfig => typeof a !== "string";
  const parts: JoinStringArg[] = filter(args, (a: JoinStringArg | JoinStringConfig) => isArg(a)) as JoinStringArg[];
  const config: JoinStringConfig | undefined = find(args, (a: JoinStringArg | JoinStringConfig) => isConfig(a)) as
    | JoinStringConfig
    | undefined;

  const metabolizedParts: string[] = reduce(
    parts,
    (curr: string[], part: JoinStringArg): string[] => {
      if (isNil(part)) {
        const replaceMissing = config?.replaceMissing;
        if (typeof replaceMissing === "boolean") {
          if (config?.replaceMissing === false) {
            return curr;
          }
          return [...curr, ""];
        } else if (!isNil(replaceMissing)) {
          return [...curr, replaceMissing];
        }
        return curr;
      } else {
        return [...curr, String(part)];
      }
    },
    []
  );
  const delimeter = config?.delimeter || " ";
  const result = metabolizedParts.join(delimeter);
  if (result === "" && config?.ifBlank !== undefined) {
    return config.ifBlank;
  }
  return result;
}
