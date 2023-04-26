import React, { useMemo } from "react";

import classNames from "classnames";

import * as ui from "lib/ui/types";
import * as typography from "lib/ui/typography/types";

export type BodyTextRenderProps = ui.ComponentProps;

export type BodyTextProps = ui.ComponentProps<{
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly children: string | ((props: BodyTextRenderProps) => JSX.Element);
  readonly level?: typography.TypographyTypeLevel<"body">;
  // Will be set based on the level if the weight is not provided.
  readonly weight?: typography.TypographyWeightName;
  readonly transform?: typography.TextTransform;
}>;

export const BodyText = ({ children, ...props }: BodyTextProps) => {
  const _className = useMemo(
    () =>
      classNames(
        "body",
        `body--${props.level || typography.DEFAULT_BODY_LEVEL}`,
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
