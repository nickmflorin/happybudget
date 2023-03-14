export * from "./arrays";
export * from "./composites";
export * from "./literals";
export * from "./strings";

export type ExtractValues<T> = keyof T extends string ? T[keyof T] : never;

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type Immutable<T> = { readonly [P in keyof T]: T[P] };

/**
Results in the type, {@link T}, if it is not empty (i.e {}), otherwise results in {@link never}.
*/
export type PopulatedOrNever<T> = keyof T extends never ? never : T;

/**
 * Used in situations where there is a difference between a function argument being undefined and
 * not provided at all.
 *
 * Usage
 * -----
 * const myFn = (optionalArg?: string | undefined | NOT_PROVIDED = NOT_PROVIDED) => {...}
 */
export const NOT_PROVIDED = "__NOT_PROVIDED__" as const;
export type NOT_PROVIDED = typeof NOT_PROVIDED;

/**
 * Represents the type of a function that takes no arguments and returns void.
 */
export type Noop = () => void;

/**
 * A function that takes no arguments, does not perform any logic and returns void.
 *
 * This is useful in cases where we have a prop or a function parameter that is a callback or a
 * function, and the default case should be a function that can be called but does not have any
 * effect.  It is particularly useful when integrating with third-party packages that expose a
 * method that takes multiple function positional arguments, but the first positional argument
 * cannot be provided.
 *
 * This use case can be seen in the usage of "react-hook-form"'s 'handleSubmit' function, which
 * takes both a function that is called when the validation succeeds and a function that is called
 * when the validation fails.
 *
 * Reference: https://react-hook-form.com/api/useform/handlesubmit
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-function */
export const Noop = () => {};
