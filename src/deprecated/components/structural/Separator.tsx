import React, { useMemo } from "react";

import classNames from "classnames";

import { ui } from "lib";

export type SeparatorProps = ui.ComponentProps<{
  readonly margin?: string | number;
  readonly color?: ui.HexColor;
  readonly style?: Omit<ui.Style, "color" | ui.CSSDirectionalProperties<"margin">>;
}>;

const _Separator = ({ style, margin, color, ...props }: SeparatorProps): JSX.Element => {
  const _style = useMemo(() => {
    let mutatedStyle: ui.Style = { ...style };
    if (margin !== undefined) {
      mutatedStyle = ui.safelyMergeIntoProvidedStyle(mutatedStyle, {
        marginTop: margin,
        marginBottom: margin,
      });
    }
    if (color !== undefined) {
      mutatedStyle = { ...mutatedStyle, borderBottom: `1px solid ${color}` };
    }
    return mutatedStyle;
  }, [style, margin, color]);

  return (
    <div
      {...props}
      role="separator"
      className={classNames("separator", props.className)}
      style={_style}
    ></div>
  );
};

export const Separator = React.memo(_Separator);
