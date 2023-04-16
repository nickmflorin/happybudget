import React from "react";

import classNames from "classnames";

import { ui } from "lib";

export type LabelProps = ui.ComponentProps<{
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly children: string;
  readonly level?: ui.TypographyTypeLevel<"label">;
  // Will be set based on the level if the weight is not provided.
  readonly weight?: ui.TypographyWeightName;
  readonly transform?: ui.TextTransform;
}>;

export const Label = ({ children, ...props }: LabelProps) => (
  <label
    className={classNames(
      "label",
      `label--${props.level || ui.DEFAULT_LABEL_LEVEL}`,
      props.weight !== undefined && `label--weight-type-${props.weight}`,
      props.transform !== undefined && `label--transform-${props.transform}`,
      props.className,
    )}
  >
    {children}
  </label>
);
