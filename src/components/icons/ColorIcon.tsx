import classNames from "classnames";

import { ui } from "lib";
import { Colors } from "deprecated/style/constants";

export type ColorIconProps = ui.ComponentProps<{
  readonly color?: ui.HexColor | null;
  readonly size: number;
  readonly selected?: boolean;
  readonly selectable?: boolean;
  readonly selectedColor?: ui.HexColor;
  readonly useDefault?: ui.HexColor | boolean;
}>;

export const ColorIcon = ({
  color,
  useDefault,
  selectedColor = "#6eb6ff",
  selectable,
  selected,
  size,
  ...props
}: ColorIconProps) => {
  const c =
    (color === undefined || color === null) &&
    (useDefault === true || typeof useDefault === "string")
      ? typeof useDefault === "string"
        ? useDefault
        : Colors.COLOR_NO_COLOR
      : color;

  if (c !== null && c !== undefined) {
    return (
      <svg
        {...props}
        className={classNames("icon icon--color", props.className)}
        style={{ ...props.style, height: `${size}px`, width: `${size}px` }}
      >
        {(selectable || selected !== undefined) && (
          <rect
            height={size}
            width={size}
            fill={selected ? selectedColor : "transparent"}
            rx={size / 2}
            ry={size / 2}
          />
        )}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={c} />
      </svg>
    );
  }
  return <></>;
};
