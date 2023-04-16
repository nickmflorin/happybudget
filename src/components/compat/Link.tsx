import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React, { ForwardedRef } from "react";

type _LinkProps = NextLinkProps & {
  readonly refAs?: string;
  readonly children: JSX.Element;
};

export type LinkProps = NextLinkProps;

const LinkWrap = (
  { children, refAs, ...props }: _LinkProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  let p = { ...props };
  if (refAs !== undefined) {
    p = { ...props, [refAs]: ref };
  }
  return React.isValidElement(children) ? React.cloneElement(children, p) : <></>;
};

const LinkWrapper = React.forwardRef(LinkWrap) as typeof LinkWrap;

/**
 * An extension of "next-link"'s {@link NextLink} component that properly uses a {@link forwardRef}
 * to prevent extraneous incorrect logs from NextJS.
 *
 * When using the {@link NextLink} component to wrap function based components that wrap a native
 * <a> or <button> element, NextJS requires that the function based component expose a ref such
 * that the {@link NextLink} can control its behavior.  If they do not - a warning/error will be
 * logged.
 *
 * However, when using a functional component that wraps a <button> element, the NextJS logs are
 * over-sensitive and fire incorrectly even when the component being wrapped leverages the
 * {@link forwardRef} to expose a ref object.  That is what this component addresses - it exposes
 * a ref and then injects that ref into the child component, avoiding unnecessary NextJS error
 * and/or warning logs.
 *
 * Credit: https://github.com/vercel/next.js/issues/7915#issuecomment-747433561gg
 */
export const Link = ({ children, refAs, ...props }: _LinkProps): JSX.Element => (
  <NextLink {...props} passHref>
    <LinkWrapper href={props.href} refAs={refAs}>
      {children}
    </LinkWrapper>
  </NextLink>
);
