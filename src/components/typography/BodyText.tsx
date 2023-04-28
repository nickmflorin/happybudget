import React from "react";

import classNames from "classnames";

import { icons } from "lib/ui";
import * as ui from "lib/ui/types";
import * as typography from "lib/ui/typography/types";
import { Icon } from "components/icons";

export type BodyTextRenderProps = ui.ComponentProps;

export type BodyTextProps = ui.ComponentProps<{
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly children: string;
  readonly icon?: icons.IconProp;
  readonly level?: typography.TypographyTypeLevel<"body">;
  // Will be set based on the level if the weight is not provided.
  readonly weight?: typography.TypographyWeightName;
  readonly transform?: typography.TextTransform;
  readonly align?: "center" | "left" | "right";
}>;

export const BodyText = ({ children, icon, ...props }: BodyTextProps) => (
  <div
    {...props}
    className={classNames(
      "body",
      `body--${props.level || typography.DEFAULT_BODY_LEVEL}`,
      `body--align-${props.align || "left"}`,
      props.weight !== undefined && `body--weight-type-${props.weight}`,
      props.transform !== undefined && `body--transform-${props.transform}`,
      props.className,
    )}
  >
    {icon !== undefined && <Icon icon={icon} />}
    {children}
  </div>
);
