type JoinStringArg = number | string | null | undefined;
type JoinStringConfig = {
  readonly delimeter?: string;
  readonly replaceMissing?: string | boolean | undefined;
  readonly ifBlank?: string | undefined;
};

type ConditionalStringJoinOptions = {
  readonly delimeter?: string;
  readonly replaceMissing?: string | boolean | undefined;
};

const isOptions = (
  c: JoinStringArg | ConditionalStringJoinOptions,
): c is ConditionalStringJoinOptions => typeof c === "object" && c !== null;

export const conditionalStringJoin = (
  ...args:
    | [JoinStringArg, JoinStringArg, ...JoinStringArg[], JoinStringConfig]
    | [JoinStringArg, JoinStringArg, ...JoinStringArg[]]
) => {
  if (args.length === 0) {
    return "";
  } else if (args.length === 1) {
    if (isOptions(args[0])) {
      throw new Error("");
    }
    return args[0];
  }

  let stringArgs: JoinStringArg[] = args.slice(0, -1) as JoinStringArg[];

  const lastArg = args[args.length - 1];
  let options: Required<ConditionalStringJoinOptions> = {
    delimeter: " ",
    replaceMissing: false,
  };
  if (!isOptions(lastArg)) {
    stringArgs = [...stringArgs, lastArg];
  } else {
    options = { ...options, ...lastArg };
  }
  return stringArgs
    .reduce((prev: string[], part: JoinStringArg): string[] => {
      if (part === null || part === undefined) {
        const replaceMissing = options?.replaceMissing;
        if (typeof replaceMissing === "boolean") {
          if (options?.replaceMissing === false) {
            return prev;
          }
          return [...prev, ""];
        } else if (replaceMissing !== undefined) {
          return [...prev, replaceMissing];
        }
        return prev;
      }
      return [...prev, String(part)];
    }, [])
    .join(options.delimeter);
};
