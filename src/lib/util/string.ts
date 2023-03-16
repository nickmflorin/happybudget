import { isNil, reduce } from "lodash";

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

type JoinStringArg = number | string | null;
type JoinStringConfig = {
  readonly delimeter?: string;
  readonly replaceMissing?: string | boolean;
  readonly ifBlank?: string;
};

export function conditionalJoinString(arg0: JoinStringArg): string;
export function conditionalJoinString(arg0: JoinStringArg, config: JoinStringConfig): string;
export function conditionalJoinString(arg0: JoinStringArg, arg1: JoinStringArg): string;
export function conditionalJoinString(
  arg0: JoinStringArg,
  arg1: JoinStringArg,
  config: JoinStringConfig,
): string;
export function conditionalJoinString(
  arg0: JoinStringArg,
  arg1: JoinStringArg,
  arg2: JoinStringArg,
): string;
export function conditionalJoinString(
  arg0: JoinStringArg,
  arg1: JoinStringArg,
  arg2: JoinStringArg,
  config: JoinStringConfig,
): string;

export function conditionalJoinString(...args: (JoinStringArg | JoinStringConfig)[]): string {
  const isConfig = (a: JoinStringArg | JoinStringConfig): a is JoinStringConfig =>
    typeof a === "object";

  let config: JoinStringConfig | null = null;
  let reversedArgs = args.slice().reverse();
  if (isConfig(reversedArgs[0])) {
    config = reversedArgs[0];
    reversedArgs = reversedArgs.slice(1);
  }
  const parts = reversedArgs.slice().reverse() as JoinStringArg[];

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
    [],
  );
  const delimeter = config?.delimeter || " ";
  const result = metabolizedParts.join(delimeter);
  if (result === "" && config?.ifBlank !== undefined) {
    return config.ifBlank;
  }
  return result;
}
