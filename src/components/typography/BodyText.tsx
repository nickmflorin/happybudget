import React, { useMemo } from "react";

import classNames from "classnames";

import { ui } from "lib";

export type BodyTextRenderProps = ui.ComponentProps;

export type BodyTextProps = ui.ComponentProps<{
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly children: string | ((props: BodyTextRenderProps) => JSX.Element);
  readonly level?: ui.TypographyTypeLevel<"body">;
  // Will be set based on the level if the weight is not provided.
  readonly weight?: ui.TypographyWeightName;
  readonly transform?: ui.TextTransform;
}>;

export const BodyText = ({ children, ...props }: BodyTextProps) => {
  const _className = useMemo(
    () =>
      classNames(
        "body",
        `body--${props.level || ui.DEFAULT_BODY_LEVEL}`,
        props.weight !== undefined && `body--weight-type-${props.weight}`,
        props.transform !== undefined && `body--transform-${props.transform}`,
        props.className,
      ),
    [props.className, props.level, props.weight, props.transform],
  );

  if (typeof children === "string") {
    return (
      <BodyText {...props}>{(p: BodyTextRenderProps) => <div {...p}>{children}</div>}</BodyText>
    );
  }
  return children({ className: _className, style: props.style, id: props.id });
};
