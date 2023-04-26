import React from "react";

import classNames from "classnames";

import * as ui from "lib/ui/types";
import * as typography from "lib/ui/typography/types";

export type LabelProps = ui.ComponentProps<{
  readonly style?: Omit<ui.Style, ui.CSSFontProperties>;
  readonly children: string;
  readonly level?: typography.TypographyTypeLevel<"label">;
  // Will be set based on the level if the weight is not provided.
  readonly weight?: typography.TypographyWeightName;
  readonly transform?: typography.TextTransform;
}>;

export const Label = ({ children, ...props }: LabelProps) => (
  <label
    className={classNames(
      "label",
      `label--${props.level || typography.DEFAULT_LABEL_LEVEL}`,
      props.weight !== undefined && `label--weight-type-${props.weight}`,
      props.transform !== undefined && `label--transform-${props.transform}`,
      props.className,
    )}
  >
    {children}
  </label>
);
