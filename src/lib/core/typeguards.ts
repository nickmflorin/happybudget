import React from "react";

import { type RequireOne } from "../util/types";
import { selectedObjAttributesEqual } from "../util/util";

/**
 * A typeguard that can be used to test whether or not a value is a {@link React.ReactElement}
 * (which is just a more specifically typed {@link JSX.Element}).
 */
export const isJSXElement = (value: unknown): value is JSX.Element => React.isValidElement(value);

type IsSpecificReactElementLookup<P> = RequireOne<{
  name?: React.ReactElement<P, React.FunctionComponent<P>>["type"]["name"];
  displayName?: React.ReactElement<P, React.FunctionComponent<P>>["type"]["displayName"];
}>;

/**
 * A typeguard that can be used to test whether or not a provided value is a specific and valid
 * React element, {@link React.ReactElement}, with the provided name.
 *
 * Note: The `name` of a component, which is only applicable for function components, is not the
 * `displayName` (which is used for logging and debugging purposes).  The `name` of a function
 * component is the name of the function.
 *
 * The `name` of a element, {@link React.ReactElement}, is the name of the function that is used
 * in the case that it is a {@link React.FunctionComponent}.  Thus, this typeguard has the inherent
 * requirement that the element is a function component, {@link React.FunctionComponent}.
 *
 * This should not be used in cases where the component does not have a `name` and should be used
 * carefully.
 *
 * @param {unknown} value
 *   The value for which the determination of whether or not it is an element with the provided
 *    `name` should be made.
 *
 * @param {React.ReactElement<P, React.FunctionComponent<P>>["type"]["name"]} name
 *   The name of the function component that represents the element.
 *
 * @returns {value is React.ReactElement<P, React.FunctionComponent<P>>}
 */
export const isSpecificReactElement = <P>(
  value: unknown,
  lookup: IsSpecificReactElementLookup<P>,
): value is React.ReactElement<P, React.FunctionComponent<P>> => {
  // The element will have a string `type` if it is a native HTML element, like `div`.
  if (isJSXElement(value) && typeof value.type !== "string") {
    // return objectAttributesEqual(value.type, {})
    if (value.type.name === undefined && value.type.displayName === undefined) {
      throw new Error(
        `Dangerous Function Usage: The component's name and displayName are not defined, component = ${JSON.stringify(
          value.type,
        )}.`,
      );
    }
    /* This call will return false if both the displayName and name are in the lookup and they are
       not equal, or just the displayName is in the lookup and it is not equal, or just the name
       is in the lookup and it is not equal. */
    return selectedObjAttributesEqual(value.type, lookup, { ignoreUndefined: true });
  }
  return false;
};
