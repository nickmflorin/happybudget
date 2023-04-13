export * from "./cells";
export * from "./editors";
export * from "./formatting";
export * from "./framework";
export * from "./share";
export * from "./table";

import classNames, { ArgumentArray, Argument } from "classnames";

export type PreviousValues<T> = [T, T] | [T];

export type TableClassNameArgument<P> =
  | Exclude<Argument, ArgumentArray>
  | TableClassNameArgumentArray<P>
  | TableClassNameParamCallback<P>;

export type TableClassNameArgumentArray<P> = Array<TableClassNameArgument<P>>;

export type TableClassNameParamCallback<T> = (params: T) => Exclude<Argument, ArgumentArray>;

export type TableClassName<P> = TableClassNameArgument<P>;

export const flattenTableClassNames = <P>(
  params: P,
  ...args: TableClassNameArgumentArray<P>
): Argument[] =>
  args.reduce((prev: Argument[], arg: TableClassNameArgument<P>) => {
    if (typeof arg === "function") {
      return [...prev, ...flattenTableClassNames(params, arg(params))];
    } else if (Array.isArray(arg)) {
      return [
        ...prev,
        ...arg.reduce(
          (p: Argument[], a: TableClassNameArgument<P>) => [
            ...p,
            flattenTableClassNames(params, a),
          ],
          [] as Argument[],
        ),
      ];
    } else {
      return [...prev, arg];
    }
  }, [] as Argument[]);

export const stringifyTableClassNames = <P>(
  params: P,
  ...args: TableClassNameArgumentArray<P>
): string => classNames(flattenTableClassNames(params, ...args));

export const stringifyTableClassNamesFn =
  <P>(...args: TableClassNameArgumentArray<P>): ((params: P) => string) =>
  (params: P) =>
    stringifyTableClassNames(params, ...args);
