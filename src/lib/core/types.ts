import { ReactFragment, ReactNode, ReactPortal, ReactElement } from "react";

import { ExtractValues } from "../util/types";

/**
 * Returns the type for a modified {@link ReactNode} that excludes the types provided as the generic
 * type argument {@link T}.
 *
 * The type {@link ReactNode} is recursive on itself via the {@link ReactFragment} type - which is
 * typed as {@link Array<ReactNode>}.  In order to restrict the {@link ReactNode}, we have to
 * also restrict the types present in the {@link Array<ReactNode>}.
 */
export type RestrictNode<
  T extends Exclude<ReactNode, ReactFragment | ReactElement | ReactPortal> | string,
> =
  | Exclude<ReactNode, T | ReactFragment | ReactPortal | ReactElement>
  | JSX.Element
  | Iterable<RestrictNode<T>>;

/**
 * A type that can be used for the `children` prop of a component in the case that the component
 * should not accept an {@link ReactNode} as a child.
 *
 * In React, for purposes of simplicity you can think of the type {@link JSX.Element} as being used
 * to refer to a component.  {@link JSX.Element} is actually just {@link ReactElement} under the
 * hood, but does not include generic type arguments for the component's props:
 *
 *   JSX.Element ~ ReactElement<any, any>;
 *
 * The difference between the {@link ReactNode} type and the {@link JSX.Element} type
 * (or the {@link ReactElement} type) is that the {@link ReactNode} type allows not just
 * a {@link JSX.Element}, but other things as well:
 *
 *   type ReactNode = ReactElement | string | number | ReactFragment | boolean | null | undefined;
 *
 * The majority of the time, the {@link ReactNode} is what a component accepts as a type for
 * it's `children` prop:
 *
 *   <SomeComponent>I am a string</SomeComponent>
 *   <div>56</div>
 *   <div>
 *     { props.visible &&
 *       <span>I will be passed as the child when visible, otherwise it will be false.
 *      </span> }
 *   </div>
 *
 * If we look closer though, in the type definition of {@link ReactNode} above, what is the
 * {@link React.ReactFragment}?  That is actually an array of {@link ReactNode}(s):
 *
 *   type ReactFragment = Iterable<ReactNode>;
 *
 * So, this means that a component can accept multiple children components as children - which is
 * usually the case:
 *
 *   <div>
 *     Just a string
 *     <h1>Header</h1>
 *     <div>Content</div>
 *   </div>
 *
 * Now, there are cases where the ability to specify multiple children is helpful when designing
 * how a component will be used - but we still want to ensure that if only one child is provided,
 * that it is not a string, or number for example.
 *
 * That is the purpose of this type:
 *
 * 1. We want to allow multiple JSX.Elements:
 *    <Component>
 *      <p>Test</p>
 *      <p>Test 2</p>
 *    </Component>
 *
 * 2. But we want to disallow a single non-JSX.Element child or a non-JSX.Element child in the
 *    multiple provided children:
 *
 *    <Component>Test</Component> // Disallowed
 *    <Component>
 *      Test // Disallowed
 *      <p>Test2</p>
 *    </Component>
 *
 * 3. We also want to allow boolean logic and conditionals to be used as a child to control the
 *    rendering:
 *
 *    <Component>
 *      {props.loading && <div>Loading</div>}
 *    </Component>
 */
export type ElementRestrictedNode = RestrictNode<string | number>;

/**
 * A type that represents the string, lowercase name of a native HTML element (i.e. "div" or "p").
 */
export type HTMLElementName = keyof HTMLElementTagNameMap & keyof JSX.IntrinsicElements;

/**
 * A generic type that results in the {@link HTMLElement} type that is associated with the string
 * name, {@link HTMLElementName}, provided as the generic type argument {@link E}.
 *
 * @example
 * HTMLElement<"div"> // HTMLDivElement
 */
export type FindHTMLElement<E extends HTMLElementName> = HTMLElementTagNameMap[E];

/**
 * A generic type that results in the string tag name of the {@link HTMLElement}, provided as the
 * first generic type argument {@link E}.
 *
 * @example
 * HTMLElementTag<HTMLButtonElement> // "button"
 */
export type HTMLElementTag<E extends HTMLElement> = ExtractValues<{
  [key in keyof HTMLElementTagNameMap &
    keyof JSX.IntrinsicElements as HTMLElementTagNameMap[key] extends E ? key : never]: key;
}> &
  keyof JSX.IntrinsicElements;
