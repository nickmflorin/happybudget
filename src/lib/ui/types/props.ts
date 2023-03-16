import { ComponentProps as ReactComponentProps, ComponentType } from "react";

import { RequiredKeys, OptionalKeys } from "utility-types";

import { HexColor } from "./style";
import { HTMLElementName, HTMLElementTag } from "../../core";
import { IntersectionIfPopulated, enumeratedLiteralsMap, EnumeratedLiteralType } from "../../util";

type Props = Record<string, unknown>;

/**
 * Defines the allowed form that externally defined props that are implemented via an interface,
 * not type, are allowed to exhibit.
 *
 * While it is important that internally defined props do not use interfaces, we cannot avoid
 * externally defined props from third-party libraries that have been implemented with an interface.
 * There are some nuanced differences between a type and an interface - and they mostly have to
 * do with the index (key) signatures.
 *
 * For the interface that defines the form for externally defined interface props, the keys need
 * to allow all index signatures (string | number | symbol) and the values need to allow any,
 * because an interface with an unknown value cannot be extended (whereas in a type it can).
 *
 * The usage of any here does not introduce any "leaks" or potential bugs - all this type does is
 * say that the externally defined props can be a Record with string keys and unknown values, or
 * any interface.
 */
interface ExternalPropsInterface {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string | number | symbol]: any;
}

/**
 * Defines the allowed form that externally defined props are allowed to exhibit.
 *
 * @see {ExternalPropsInterface}
 */
type ExternalProps = ExternalPropsInterface | Props;

/**
 * The third-party, external component, {@link ComponentType}, or the HTML Element,
 * {@link HTMLElement}, that is being extended when creating an internal component at the root
 * level.
 *
 * The HTML Element, {@link HTMLElement}, can be specified as either the element itself or the
 * string tag name associated with the {@link HTMLElement}.
 */
type ExternalRoot = HTMLElement | HTMLElementName | ComponentType;

/**
 * Third-party props for external components that should always be ignored.
 *
 * 1. prefixCls: An AntD CSS-in-JS geared prop for removing AntD prefixes and using internal ones.
 */
type IgnoreThirdPartyProps = "prefixCls";

type _HTMLElementProps<E extends HTMLElement | HTMLElementName = HTMLElement> =
  E extends HTMLElement
    ? JSX.IntrinsicElements[HTMLElementTag<E>]
    : E extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[E]
    : never;

/**
 * The props that are associated with the {@link HTMLElement} dictated by the generic type argument,
 * {@link E}, with the internal type definitions injected.
 *
 * @example
 * HTMLElementProps<"div"> // Props for a <div> element with our internal definitions included.
 *
 * @example
 * // Props for a <div> element with our internal definitions included.
 * HTMLElementProps<HTMLDivElement>
 */
export type HTMLElementProps<E extends HTMLElement | HTMLElementName = HTMLElement> =
  _OmitRestrictedProps<_HTMLElementProps<E>> & UniversalComponentProps;

type _ThirdPartyComponentProps<E extends ComponentType> = ReactComponentProps<E>;

/**
 * The props that are associated with the third-party {@link ComponentType} dictated by the generic
 * type argument, {@link E}, with the internal type definitions injected.
 *
 * @example
 * // Props for the <Button /> AntD component with our internal definitions included.
 * ThirdPartyComponentProps<typeof import("antd").Button>;
 */
export type ThirdPartyComponentProps<E extends ComponentType> = _OmitRestrictedProps<
  _ThirdPartyComponentProps<E>
> &
  UniversalComponentProps;

/* Any props that are defined in a third-party component or on an HTMLElement should be excluded if
   defined internally or in the UniversalComponentProps. */
type _RestrictedPropKeys<P extends Props | undefined = undefined> =
  | UniversalComponentProp
  | keyof P;

type _OmitRestrictedProps<T, P extends Props | undefined = undefined> = Omit<
  T,
  _RestrictedPropKeys<P> | IgnoreThirdPartyProps
>;

type _UniversalConsistentPropType<
  K extends UniversalComponentProp,
  V,
> = V extends UniversalComponentProps[K] ? V : never;

/**
 * A generic type for the prop defined by the prop name {@link K} in the props defined by {@link P}
 * that ensures that if the prop {@link K} is associated with a universal component prop,
 * {@link UniversalComponentProp}, that the type definition for the prop value {@link P[K]}
 * is the same type, or a sub-type, of the universally defined type definition for the same
 * prop, {@link UniversalComponentProps[K]}.
 *
 * Whether or not the prop is required or optional in {@link P} or {@link UniversalComponentProps}
 * does not affect whether or not it is considered a valid sub-type of the universal props.
 */
type ComponentPropType<
  P extends Props,
  K extends keyof P | UniversalComponentProp,
> = K extends OptionalKeys<P> & RequiredKeys<UniversalComponentProps>
  ? /* If the prop is optional in P but required in UniversalComponentProps, it should still be
	     treated as optional in the component's props, and the optionality should cause the type to be
			 deemed inconsistent. */
    P[K] extends infer V | undefined
    ? _UniversalConsistentPropType<K, V>
    : _UniversalConsistentPropType<K, P[K]>
  : K extends UniversalComponentProp & keyof P
  ? _UniversalConsistentPropType<K, P[K]>
  : K extends UniversalComponentProp
  ? UniversalComponentProps[K]
  : K extends keyof P
  ? P[K]
  : never;

/**
 * Returns the keys of the provided props, {@link P}, that are optional - including the keys of the
 * {@link UniversalComponentProps}.  If a given key is optional in the provided props, {@link P},
 * but required in the {@link UniversalComponentProps}, it will be treated as optional.
 */
type OptionalComponentPropKeys<P extends Props> =
  | Exclude<OptionalKeys<P>, OptionalKeys<UniversalComponentProps>>
  | Exclude<OptionalKeys<UniversalComponentProps>, RequiredKeys<P>>;

/**
 * Returns the keys of the provided props, {@link P}, that are required - including the keys of the
 * {@link UniversalComponentProps}.  If a given key is required in the provided props, {@link P},
 * but optional in the {@link UniversalComponentProps}, it will be treated as required.
 */
type RequiredComponentPropKeys<P extends Props> =
  | Exclude<RequiredKeys<P>, RequiredKeys<UniversalComponentProps>>
  | Exclude<RequiredKeys<UniversalComponentProps>, OptionalKeys<P>>;

/**
 * This should not be used externally.  This type is responsible for ensuring that the props defined
 * by the {@link UniversalComponentProps} are present in the resulting type, and that any keys of
 * the props, {@link P}, which are also keys of the {@link UniversalComponentProps}, are typed to be
 * consistent with the types of the {@link UniversalComponentProps}.
 *
 * If this is being used with the props for a third-party component or HTMLElement, the props must
 * have been wrapped by {@link ExternalComponentProps} before they are provided to this type, such
 * that the props associated with the keys of the {@link UniversalComponentProps} are not present.
 */
type _ComponentProps<P extends Props> = IntersectionIfPopulated<
  {
    [key in OptionalComponentPropKeys<P>]?: ComponentPropType<P, key>;
  },
  {
    [key in RequiredComponentPropKeys<P>]-?: ComponentPropType<P, key>;
  }
>;

type _ExternalComponentProps<
  E extends ExternalRoot | ExternalProps,
  P extends Props | undefined = undefined,
> = E extends HTMLElement | HTMLElementName
  ? _OmitRestrictedProps<_HTMLElementProps<E>, P>
  : E extends ComponentType
  ? _OmitRestrictedProps<_ThirdPartyComponentProps<E>, P>
  : E extends ExternalProps
  ? _OmitRestrictedProps<E, P>
  : never;

/**
 * Props that should be used for an external third-party component, an HTMLElement or the external
 * component's props themselves.  External props for a third-party component or an HTMLElement will
 * be modified such that the resulting type does not contain any prop defined in the
 * {@link UniversalComponentProps} type or any prop defined in the optionally provided
 * internal props type, {@link P}.
 *
 * @example
 * // Using the props for a `<button />` component.
 *
 * type Element = HTMLButtonElement // Has many props, including `className`, `style` and `id`.
 * type Props = ExternalComponentProps<Element>
 * type C = Props["className"] // Error: Property 'className' does not exist on type 'Props'.
 *
 * @example
 * // Using the props for an AntD <Button /> component.
 *
 * type Props = ExternalComponentProps<typeof Button>
 * type C = Props["className"] // Error: Property 'className' does not exist on type 'Props'.
 *
 * @example
 * // Using the props for an AntD <Button /> component that should omit props defined internally.
 * // The internally defined props are removed from the externally defined props.
 *
 * type InternalProps = { onClick: (e: CustomEvent) => void };
 * type Props = ExternalProps<typeof Button, InternalProps>;
 * type ClickHandler = Props["onClick"] // Error: Property 'onClick' does not exist on type 'Props'.
 *
 * @example
 * // Using the props for an AntD <Button /> component that should omit props defined internally,
 * // and omit certain values from the AntD props altogether.
 *
 * import { Button, ButtonProps } from "antd";
 * type InternalProps = { onClick: (e: CustomEvent) => void };
 * type Props = ExternalComponentProps<Omit<ButtonProps, "size">, InternalProps>;
 * type ClickHandler = Props["onClick"] // Error: Property 'onClick' does not exist on type 'Props'.
 * type Size = Props["size"] // Error: Property 'size' does not exist on type 'Props'.
 *
 */
export type ExternalComponentProps<E extends ExternalRoot | Props> = _ExternalComponentProps<E> &
  UniversalComponentProps;

/**
 * Attributes of {@link React.CSSProperties} that should not be used for all components in the
 * application.
 *
 * - fontStyle
 *   This style property is not allowed because our font-styles are dictated by the specific font
 *   file that is used for a given weight.  As such, applying a font-style will either not work or
 *   will cause the font contained in the associated font file to be styled two times.
 *
 *   For instance, if we have a font file that is associated with the font-family Nunito and the
 *   font-weight 600, applying "fontStyle: bold" will make the font appear too bold, because it
 *   will bolden an already bold font.
 */
type DisallowedCSSStyleProperties = "fontStyle";

/**
 * Attributes of {@link React.CSSProperties} that are typed to be more restrictive than their
 * associated types in {@link React.CSSProperties}.
 */
type OverriddenCSSStyleProperties = {
  color: HexColor;
  backgroundColor: HexColor;
};

/**
 * A type that should be used for the `style` prop for all components in the application.
 *
 * The type {@link React.CSSProperties} should not be used directly, but this type should be
 * referenced instead.  This type will include modifications and restrictions to the base
 * {@link React.CSSProperties} type - so this type should be the source of truth.
 */
export type Style = Omit<
  React.CSSProperties,
  DisallowedCSSStyleProperties | keyof OverriddenCSSStyleProperties
> &
  Partial<OverriddenCSSStyleProperties>;

/**
 * The properties that all components in the application should be capable of accepting and passing
 * through to the component or element it extends.
 *
 * When there is a property that all components in the application should be capable of both
 * accepting and passing through, it should be added here.
 *
 * This type is not meant to be used directly, instead the {@link ComponentProps} type can be used
 * without any generic type arguments.
 */
export type UniversalComponentProps = Readonly<{
  id?: string;
  className?: string;
  style?: Style;
}>;

export const UniversalComponentPropNames = enumeratedLiteralsMap([
  "id",
  "className",
  "style",
] as const);

type _UniversalConsistentProp = EnumeratedLiteralType<typeof UniversalComponentPropNames>;
export type UniversalComponentProp = [_UniversalConsistentProp] extends [
  keyof UniversalComponentProps,
]
  ? _UniversalConsistentProp
  : "The universal component prop constants are not consistent with the type.";

/**
 * A generic type that will represent the props that a component should accept. This type can be
 * used in a variety of ways, depending on what root component, if any, is being extended.
 *
 * When this generic type is used, the props type will always ensure that internally defined props
 * are both favored over third-party/HTMLElement props and any prop that is a universal component
 * prop ( style, className, id ... ) {@link UniversalComponentProp} is properly typed.
 *
 * Usage
 * -----
 *
 * Without Generic Type Args
 * -------------------------
 * Not including any type arguments will simply yield the universal props:
 *
 * 		ComponentProps  // { style?: React.CSSProperties, className?: string; id?: string }
 *
 * Including Universal Props
 * -------------------------
 * To simply include the {@link UniversalComponentProps} with a generic set of  props {@link Props},
 * use as follows:
 *
 *   type MyProps = ComponentProps<{ foo: string; bar: number }>;
 *
 * This will ensure that the {@link UniversalComponentProps} are included and are typed properly
 * even if they are defined in the type argument {@link P}:
 *
 *   type MyProps = ComponentProps<{ foo: string; bar: number; className: string }>;
 *   MyProps["className"] // string
 *   UniversalComponentProps["className"] // string | undefined
 *
 * If a universal prop is overridden with a type that is not consistent, the props will use
 * {@link never}.
 *
 *   type MyProps = ComponentProps<{ foo: string; bar: number; className: number }>;
 *   MyProps["className"] // never
 *
 * Extending an HTML Element
 * -------------------------
 * If props are needed for a component that extends an HTMLElement, such as <button />, they can
 * simply be generated as
 *
 *   type MyProps = ComponentProps<HTMLButtonElement>;
 *
 * If you need to add some of your own props alongside, you can simply provide them as the first
 * type argument:
 *
 *   type MyProps = ComponentProps<{foo: string}, HTMLButtonElement>;
 *
 * Extending a Third Party Component
 * ---------------------------------
 * If props are needed for a component that extends an third-party component, such as
 * import("antd").Button, they can simply be generated as
 *
 *   type MyProps = ComponentProps<typeof Button>;
 *
 * If you need to add some of your own props alongside, you can simply provide them as the first
 * type argument:
 *
 *   type MyProps = ComponentProps<{foo: string}, typeof Button>;
 *
 * In all cases, this type will ensure that there are no type conflicts between the third-party
 * components and internal or universal component props.
 *
 * Directly Using External Props
 * -----------------------------
 * Sometimes, we will only want to include a subset of props from an external component or HTML
 * Element.  In these cases, the external props can be explicitly provided as the type of the
 * props themselves, rather than including the HTMLElement type or the type of the third-party
 * component itself.  This is allowed, but the external props must be explicitly denoted as
 * being from an external source by including as { external: ExternalProps }:
 *
 *   import { Button, ButtonProps } from "antd";
 *
 *   type MyProps = ComponentProps<{ external: Pick<ButtonProps, "loading"> }>;
 *   type V = MyProps["loading"] // boolean
 *
 * Again, if you need to combine internal props with the third-party component or HTML Element
 * props, it can be done by including the internal props as the first type argument:
 *
 *   import { Button, ButtonProps } from "antd";
 *
 *   type MyProps = ComponentProps<{ loading: number }, { external: Pick<ButtonProps, "loading"> }>;
 *   type V = MyProps["loading"] // number, the internal type overrides the external type.
 *
 */
export type ComponentProps<
  P extends Props | ExternalRoot | { external: ExternalProps } | undefined = undefined,
  E extends ExternalRoot | { external: ExternalProps } | undefined = undefined,
> = P extends undefined
  ? E extends undefined
    ? UniversalComponentProps
    : "Improper Usage: The second type argument is not applicable unless the first is defined."
  : P extends HTMLElement | HTMLElementName
  ? E extends undefined
    ? _ComponentProps<_ExternalComponentProps<P>>
    : "Improper Usage: The second type argument should not be provided when the first is an \
      HTMLElement or a third-party component."
  : P extends { external: ExternalProps }
  ? E extends undefined
    ? _ComponentProps<_ExternalComponentProps<P["external"]>>
    : "Improper Usage: The second type argument should not be provided when the first is the \
    props for an external component."
  : P extends Props
  ? E extends undefined
    ? _ComponentProps<P>
    : E extends HTMLElement | HTMLElementName
    ? _ComponentProps<P & _ExternalComponentProps<E, P>>
    : E extends { external: ExternalProps }
    ? _ComponentProps<P & _ExternalComponentProps<E["external"], P>>
    : never
  : never;
